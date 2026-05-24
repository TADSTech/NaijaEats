# ============================================================
# Naija Eats — Production Dockerfile
# Base: python:3.10-slim
# ============================================================

# --- Build stage: install dependencies with layer caching ---
FROM python:3.10-slim AS builder

WORKDIR /build

# Install build tools needed by some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --default-timeout=1000 --prefix=/install --no-cache-dir -r requirements.txt


# --- Runtime stage: lean final image ---
FROM python:3.10-slim AS runtime

# Non-root user for security
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY app/ ./app/
COPY models/ ./models/
COPY .env.example .env.example

# Ensure data directories exist with correct permissions
RUN mkdir -p data/chroma data/raw data/processed && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

# Health check wired to our /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; import os; port = os.environ.get('PORT', '8000'); urllib.request.urlopen(f'http://localhost:{port}/health')"

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

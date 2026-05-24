# 🚀 Deployment Guide (Hackathon Quick-Deploy)

This guide covers how to deploy the entire Naija Eats stack for free, ensuring it stays up, fast, and accessible for judges during the hackathon.

## Architecture Overview
- **Backend**: Render (Python Web Service) - Required for AI review simulation
- **Frontend**: Vercel (Static Site) - Separate deployment
- **Keep-Alive**: cron-job.org (Prevents free tier spin down)

> **Note**: The backend is required for this demo. The frontend makes API calls to the `/simulate-review` endpoint for the core AI functionality.

---

## 1. Prepare Environment Variables

Copy the required environment variables from `.env.example` to your deployment platform:

```bash
# API Keys (required - at least one must be set)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# LLM Settings
LLM_MODEL=claude-sonnet-4-20250514

# Embedding Settings
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Retrieval Settings
TOP_K_RETRIEVAL=5

# Profiling Settings
MIN_USER_REVIEWS=10

# Feature Flags
ENABLE_CULTURAL_LAYER=true

# Storage
CHROMA_PERSIST_DIR=./data/chroma

# Logging
LOG_LEVEL=INFO
```

**Minimum Required for Demo**:
- `OPENROUTER_API_KEY` (or ANTHROPIC_API_KEY / OPENAI_API_KEY)
- `ENABLE_CULTURAL_LAYER=true`

**Frontend Environment Variable**:
- `VITE_API_URL`: Your deployed backend URL (e.g., `https://naija-eats-api.onrender.com`)

---

## 2. Deploy the Backend (FastAPI + Python)

We will use Render to host the FastAPI application using Python runtime.

1. Create a `runtime.txt` file in your repository root with:
   ```
   python-3.10.16
   ```
   This ensures Python 3.10 is used (has pre-built wheels for pydantic-core).

2. Create an account on [Render.com](https://render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. Fill in the following details:
   - **Name**: `naija-eats-api`
   - **Region**: Choose the closest one to you (e.g., Frankfurt/London)
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
6. Expand **Advanced**, and add your Environment Variables:
   - `OPENROUTER_API_KEY`: `your_actual_key_here`
   - `ENABLE_CULTURAL_LAYER`: `true`
   - `LLM_MODEL`: `claude-sonnet-4-20250514`
   - `EMBEDDING_MODEL`: `all-MiniLM-L6-v2`
   - `TOP_K_RETRIEVAL`: `5`
   - `MIN_USER_REVIEWS`: `10`
   - `CHROMA_PERSIST_DIR`: `./data/chroma`
   - `LOG_LEVEL`: `INFO`
7. Click **Create Web Service**.

> **Note:** Render takes a few minutes to build and deploy. Once complete, you will receive a URL like `https://naija-eats-api.onrender.com`. **Save this URL** - you'll need it for the frontend configuration.

---

## 3. Deploy the Frontend (Vercel)

1. Create an account on [Vercel.com](https://vercel.com/).
2. Click **Add New** → **Project**.
3. Connect your GitHub repository.
4. Fill in the following details:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

### Configure Frontend Environment Variable

1. After deployment, go to your Vercel project **Settings** → **Environment Variables**.
2. Add the following variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://naija-eats-api.onrender.com`)
3. Redeploy the project to apply the environment variable.

---

## 4. Setting up Keep-Alive (Crucial for Free Tiers)

Render spins down Free Web Services after 15 minutes of inactivity. When a judge visits, they might face a 50+ second cold start. Let's prevent that.

1. Go to [cron-job.org](https://cron-job.org/en/) and create a free account.
2. Click **Create cronjob**.
3. **URL**: Enter your backend health endpoint (e.g., `https://naija-eats-api.onrender.com/health`).
4. **Execution schedule**: Every 10 minutes.
5. Click **Create**.

Your backend API will now stay continuously "awake" for the duration of the hackathon! 🎉

---

## Quick Checklist before Submission
- [ ] Added all required backend `.env` variables securely in the Render dashboard.
- [ ] Deployed backend on Render and saved the URL.
- [ ] Deployed frontend on Vercel with `VITE_API_URL` set to the Render backend URL.
- [ ] Verified `CORS` in `app/main.py` is `allow_origins=["*"]`.
- [ ] Checked that `cron-job.org` successfully pinged `/health`.
- [ ] Tested the deployed Vercel URL to ensure the frontend loads and API calls work.

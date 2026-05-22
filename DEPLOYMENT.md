# 🚀 Deployment Guide (Hackathon Quick-Deploy)

This guide covers how to deploy the entire Naija Eats stack for free, ensuring it stays up, fast, and accessible for judges during the hackathon.

## Architecture overivew
- **Frontend**: Render (Static Site) OR Vercel
- **Backend**: Render (Web Service using Docker)
- **Keep-Alive**: cron-job.org (Prevents free tier spin down)

---

## 1. Deploy the Backend (FastAPI + Docker)

We will use Render to host the Dockerized FastAPI application.

1. Create an account on [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Fill in the following details:
   - **Name**: `naija-eats-api`
   - **Region**: Choose the closest one to you (e.g., Frankfurt/London)
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty)
   - **Environment**: Select `Docker`
   - **Instance Type**: Free
5. Expand **Advanced**, and add your Environment Variables matching your `.env`:
   - `OPENROUTER_API_KEY`: `your_key`
   - `ENABLE_CULTURAL_LAYER`: `true`
6. Click **Create Web Service**.

> **Note:** Render takes a few minutes to build the container. Once complete, you will receive a URL like `https://naija-eats-api.onrender.com`.

---

## 2. Connect Frontend to the Deployed Backend

Before deploying the frontend, update the fetch URL.

In `frontend/src/pages/Dashboard.jsx`, locate the API call:
```javascript
// Change this:
const response = await fetch('http://localhost:8000/simulate-review', { ... })

// To use an environment variable (or hardcode your Render link if in a rush):
const API_URL = import.meta.env.VITE_API_URL || 'https://naija-eats-api.onrender.com'
const response = await fetch(`${API_URL}/simulate-review`, { ... })
```

*Don’t forget to test locally after making this change!*

---

## 3. Deploy the Frontend (React + Vite)

You can deploy the frontend as a static site on Render as well, or on Vercel. We will use Render for simplicity.

1. On Render, click **New +** and select **Static Site**.
2. Connect your GitHub repository again.
3. Fill in the following details:
   - **Name**: `naija-eats-app`
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm install && pnpm build` (or `npm install && npm run build`)
   - **Publish Directory**: `frontend/dist`
4. Click **Create Static Site**.

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
- [ ] Added real `.env` variables securely in the Render dashboard.
- [ ] Updated the frontend fetch requests.
- [ ] Verified `CORS` in `app/main.py` is `allow_origins=["*"]`.
- [ ] Checked that `cron-job.org` successfully pinged `/health`.

# Deployment Guide — Blood Cancer Cell Detection System

> **Total Cost: $0/month** (all free tiers)

| Service | Platform | Cost |
|---------|----------|------|
| Frontend (React/Vite) | Vercel | $0 |
| Backend (Express + SQLite) | Render | $0 |
| ML Service (FastAPI + PyTorch) | Hugging Face Spaces | $0 |

---

## Prerequisites

Before starting, make sure you have:

- A **GitHub account** with the project pushed to a repository
- A **Google reCAPTCHA v2** site key and secret key (generate at [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) — select **v2 "I'm not a robot" Checkbox**)
- Accounts on [Hugging Face](https://huggingface.co), [Render](https://render.com), and [Vercel](https://vercel.com) (all free)
- **Git LFS** installed locally (`git lfs install`)

---

## STEP 1: Deploy ML Service on Hugging Face Spaces (Do This First)

The ML service hosts your PyTorch models (~107MB of weights). Hugging Face Spaces gives you **2 vCPU + 16GB RAM for free** — more than enough for PyTorch inference.

### 1.1 Create the Space

1. Go to [huggingface.co](https://huggingface.co) and sign up / log in
2. Click your **profile icon** (top right) → **"New Space"**
3. Configure:
   - **Space name:** `blood-cancer-ml`
   - **License:** Pick any (e.g., MIT) or skip
   - **SDK:** Select **Docker**
   - **Hardware:** **CPU Basic (Free)** — 2 vCPU, 16GB RAM
   - **Visibility:** **Public** (required for free tier)
4. Click **"Create Space"**

### 1.2 Clone the Space Locally

```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/blood-cancer-ml
cd blood-cancer-ml
```

> Replace `YOUR_USERNAME` with your actual Hugging Face username.

### 1.3 Copy ML Service Files Into the Space

Copy the contents of your project's `ml-service/` folder into the cloned Space directory:

```bash
# From your project root
cp -r ml-service/* /path/to/blood-cancer-ml/
```

Your Space folder should now look like:

```
blood-cancer-ml/
  app/
    __init__.py
    main.py
    models.py
    inference.py
    gradcam.py
    config.py
  weights/
    best_resnet50_bloodcells.pth      (91 MB)
    best_efficientnetb0_bloodcells.pth (16 MB)
  requirements.txt
  Dockerfile
```

### 1.4 Edit the Dockerfile

Hugging Face Spaces requires apps to run on **port 7860**. Open `Dockerfile` and change the last two lines:

**Before:**
```dockerfile
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**After:**
```dockerfile
EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

### 1.5 Push to Hugging Face

```bash
cd /path/to/blood-cancer-ml

git lfs install
git lfs track "*.pth"
git add .
git commit -m "Deploy ML service"
git push
```

> **Important:** Git LFS must be installed so the `.pth` weight files (91MB + 16MB) are uploaded correctly. Without LFS, the push may fail or corrupt the files.

### 1.6 Wait for Build

- Go to your Space page: `https://huggingface.co/spaces/YOUR_USERNAME/blood-cancer-ml`
- Watch the **"Building"** status — takes **5–10 minutes** (PyTorch is a large dependency)
- Once status shows **"Running"**, your service is live

### 1.7 Test It

Visit:
```
https://YOUR_USERNAME-blood-cancer-ml.hf.space/health
```

You should see:
```json
{"status": "healthy", "models_loaded": ...}
```

### 1.8 Copy Your ML Service URL

Save this URL — you'll need it in Step 2:
```
https://YOUR_USERNAME-blood-cancer-ml.hf.space
```

> **Note:** HF Spaces sleeps after ~15 min of inactivity. The first request after sleep takes ~30–60 seconds to cold start. This is normal for free tier.

---

## STEP 2: Deploy Backend on Render (Free Tier)

### 2.1 Push Project to GitHub

If not already done, push your full project to a GitHub repository:

```bash
git add -A
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Create the Web Service

1. Go to [render.com](https://render.com) and sign up / log in
2. Click **"New +"** → **"Web Service"**
3. **Connect your GitHub repository** (authorize Render to access your GitHub if prompted)
4. Select your project repository

### 2.3 Configure the Service

| Setting | Value |
|---------|-------|
| **Name** | `blood-cancer-backend` |
| **Root Directory** | `Backend` |
| **Runtime** | `Docker` |
| **Instance Type** | **Free** |

### 2.4 Add Environment Variables

Click the **"Environment"** section and add these variables one by one:

| Key | Value |
|-----|-------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:./prisma/dev.db` |
| `JWT_SECRET` | *(see below)* |
| `BCRYPT_ROUNDS` | `12` |
| `ML_SERVICE_URL` | `https://YOUR_USERNAME-blood-cancer-ml.hf.space` |
| `FRONTEND_URL` | `https://placeholder.vercel.app` |
| `RECAPTCHA_SECRET_KEY` | *(your Google reCAPTCHA v2 secret key)* |

**How to generate JWT_SECRET:** Open any terminal and run:
```bash
openssl rand -hex 32
```
Copy the output and paste it as the value.

> **Note:** You'll update `FRONTEND_URL` to your real Vercel URL after Step 3.

### 2.5 Create the Service

Click **"Create Web Service"** and wait for the build to complete (2–5 minutes).

### 2.6 Copy Your Backend URL

Once deployed, your backend URL will look like:
```
https://blood-cancer-backend.onrender.com
```

Save this — you'll need it in Step 3.

### 2.7 Test It

Visit:
```
https://blood-cancer-backend.onrender.com/health
```

You should see:
```json
{"status": "OK", "timestamp": "..."}
```

> **SQLite Warning:** Render free tier uses ephemeral disk — the SQLite database resets on every deploy/restart. This is fine for demos and academic projects. For persistent data in production, switch to Render's free PostgreSQL and update the Prisma schema.

---

## STEP 3: Deploy Frontend on Vercel (Free Tier)

### 3.1 Create the Project

1. Go to [vercel.com](https://vercel.com) and sign up / log in
2. Click **"Add New Project"**
3. Click **"Import"** next to your GitHub repository
4. Select your project repository

### 3.2 Configure the Build

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `Frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://blood-cancer-backend.onrender.com` *(your Render URL from Step 2)* |
| `VITE_RECAPTCHA_SITE_KEY` | *(your Google reCAPTCHA v2 site key)* |

### 3.4 Deploy

Click **"Deploy"** — Vercel builds and deploys in ~1 minute.

### 3.5 Copy Your Frontend URL

Once deployed, your URL will look like:
```
https://blood-cancer-frontend.vercel.app
```

---

## STEP 4: Update Backend CORS (Critical!)

The backend needs to know your frontend URL to allow cross-origin requests. Without this, login and all API calls will fail with CORS errors.

1. Go to **Render Dashboard** → your `blood-cancer-backend` service
2. Click the **"Environment"** tab
3. Find `FRONTEND_URL` and change it from `https://placeholder.vercel.app` to your actual Vercel URL:
   ```
   https://blood-cancer-frontend.vercel.app
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy (~1 minute)

---

## STEP 5: Update reCAPTCHA Domains

Your reCAPTCHA keys need to know which domains are allowed:

1. Go to [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Click your site entry
3. Under **Domains**, add:
   - `your-app.vercel.app` (your Vercel domain)
   - `localhost` (for local development)
4. Click **Save**

---

## STEP 6: Verify Everything Works

1. **Visit your Vercel URL** in the browser
2. **Log in** with a demo account:
   - **Email:** `arjun.mehta@admin.com`
   - **Password:** `password123`
3. **Complete the reCAPTCHA** checkbox
4. **Upload a blood cell image** and run a prediction
5. **Confirm:**
   - reCAPTCHA widget appears on login and signup pages
   - Both models (ResNet50 & EfficientNet) return results
   - Grad-CAM heatmap appears
   - Confidence scores and cell breakdown display correctly

---

## Summary of Deployed URLs

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `https://your-app.vercel.app` |
| Backend | Render | `https://blood-cancer-backend.onrender.com` |
| ML Service | HF Spaces | `https://YOUR_USERNAME-blood-cancer-ml.hf.space` |

---

## How ML Weights Are Deployed

```
Your Machine                    Hugging Face Spaces
    |                                   |
    |  git lfs push (91MB + 16MB)       |
    |---------------------------------->|
    |                                   |
    |              Docker build runs:   |
    |              COPY weights ./weights|
    |              Weights baked into   |
    |              container image      |
    |                                   |
    |              At startup:          |
    |              torch.load() loads   |
    |              weights into RAM     |
    |              (~200MB in memory)   |
    |                                   |
    |              16GB RAM available   |
    |              (more than enough)   |
```

- Weights are pushed via **Git LFS** to Hugging Face (they handle large files natively)
- The **Dockerfile copies weights into the image** at build time (`COPY weights ./weights`)
- **FastAPI loads them into RAM** at container startup via `torch.load()`
- **16GB free RAM** on HF Spaces is more than enough for both models (~200MB loaded)
- No S3, no external storage, no extra cost

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **Login fails / no demo accounts** | Render may not have seeded the DB. Check deploy logs for `seed.js` output. Redeploy if needed. |
| **Prediction times out** | HF Space is sleeping. First request takes 30–60s. Wait and try again. |
| **CORS error in browser console** | `FRONTEND_URL` env var on Render doesn't match your Vercel URL exactly (check for trailing slashes). |
| **ML health returns 503** | Weights didn't upload properly. Check HF Space build logs. Make sure Git LFS tracked the `.pth` files. |
| **"Cannot connect to ML service"** | Double-check `ML_SERVICE_URL` on Render matches your HF Space URL. No trailing slash. |
| **reCAPTCHA shows "Invalid key type"** | You're using v3 keys with v2 widget. Generate new **v2** keys at [reCAPTCHA admin](https://www.google.com/recaptcha/admin). |
| **reCAPTCHA shows "ERROR for site owner"** | Your domain is not added to the reCAPTCHA allowed domains list. Add it in the admin panel. |
| **Database resets after deploy** | Expected on Render free tier (ephemeral disk). For persistence, use Render's free PostgreSQL. |

---

## Environment Variables Quick Reference

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | `3001` |
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` |
| `JWT_SECRET` | Yes | Random 64-char hex string (`openssl rand -hex 32`) |
| `BCRYPT_ROUNDS` | Yes | `12` |
| `ML_SERVICE_URL` | Yes | Your HF Spaces URL |
| `FRONTEND_URL` | Yes | Your Vercel URL |
| `RECAPTCHA_SECRET_KEY` | Yes | Google reCAPTCHA v2 secret key |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Your Render backend URL |
| `VITE_RECAPTCHA_SITE_KEY` | Yes | Google reCAPTCHA v2 site key |

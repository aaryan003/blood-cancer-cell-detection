# 🚀 DEPLOY WITH DOCKER - QUICK START

## Railway (Easiest - 5 Minutes)

### Step 1: Push to GitHub
```powershell
cd "C:\Users\Akshat\IBM Project"
git add .
git commit -m "Deploy with Docker"
git push origin main
```

### Step 2: Deploy on Railway

1. Go to: **https://railway.app**
2. Click **"Login with GitHub"**
3. Click **"New Project"**
4. Click **"Deploy from GitHub repo"**
5. Select **"blood-cancer-cell-detection"**
6. Railway auto-detects docker-compose.yml
7. Creates 3 services automatically!

### Step 3: Add Environment Variables

**ML Service:**
```
PYTHONUNBUFFERED = 1
```

**Backend:**
```
JWT_SECRET = your-secret-key
ML_SERVICE_URL = ${{ml-service.RAILWAY_PRIVATE_DOMAIN}}:8000
```

**Frontend:**
```
VITE_API_URL = https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

### Step 4: Add Backend Volume

1. Click "backend" service
2. Go to "Volumes"
3. Add volume at `/app/prisma`

### Step 5: Done!

Railway deploys all 3 Docker containers automatically.

Get your URLs from each service's Settings → Domains

---

## ✅ What Railway Does

- ✅ Reads your docker-compose.yml
- ✅ Builds 3 Docker images
- ✅ Deploys 3 containers
- ✅ Provides public URLs
- ✅ Handles networking
- ✅ All in 5 minutes!

---

## 💰 Cost

**$5 free credit** = ~500 hours of usage

Then ~$5-10/month for all 3 services

---

## 🎯 Alternative: Render with Docker

If Railway doesn't work, use Render:

1. Go to: https://dashboard.render.com
2. Create 3 Web Services (one for each)
3. For each service:
   - Environment: **Docker** (not Python/Node)
   - Root Directory: `ml-service`, `Backend`, or `Frontend`
   - Dockerfile Path: `Dockerfile`

---

**Recommended: Try Railway first - it's the easiest!**

Go to: https://railway.app

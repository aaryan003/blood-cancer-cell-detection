# 🚀 FREE DEPLOYMENT GUIDE - Complete Walkthrough

Deploy all 3 services (Frontend, Backend, ML) for **100% FREE** on Render.

**Total Time: 20 minutes**

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Render account (sign up at https://render.com)
- [ ] Model weights (can add later)

---

## 🎯 STEP 1: Push Code to GitHub (5 minutes)

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `blood-cancer-detection`
3. Set to **Private** (recommended)
4. Click "Create repository"

### 1.2 Push Your Code

Open PowerShell in your project folder:

```powershell
cd "C:\Users\Akshat\IBM Project"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Blood Cancer Detection System"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/blood-cancer-detection.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Model weights won't be pushed (they're gitignored). We'll handle them separately.

---

## 🎯 STEP 2: Deploy on Render (10 minutes)

### 2.1 Sign Up for Render

1. Go to https://dashboard.render.com
2. Click "Get Started"
3. Sign up with GitHub (easiest)
4. Authorize Render to access your repositories

### 2.2 Deploy Using Blueprint

1. Click **"New +"** button (top right)
2. Select **"Blueprint"**
3. Click **"Connect a repository"**
4. Find and select `blood-cancer-detection`
5. Render will detect `render.yaml` automatically
6. Click **"Apply"**

### 2.3 Wait for Deployment

Render will now deploy all 3 services:

```
⏳ ML Service (3-5 min)
⏳ Backend (2-3 min)
⏳ Frontend (2-3 min)
```

**Total: 7-11 minutes**

Watch the logs in real-time. You'll see:
- ✅ ML Service: "Live" (green)
- ✅ Backend: "Live" (green)
- ✅ Frontend: "Live" (green)

---

## 🎯 STEP 3: Get Your URLs (1 minute)

After deployment completes, click on each service to get URLs:

| Service | Your URL |
|---------|----------|
| **Frontend** | https://blood-cancer-frontend.onrender.com |
| **Backend** | https://blood-cancer-backend.onrender.com |
| **ML Service** | https://blood-cancer-ml-service.onrender.com |

**Save these URLs!**

---

## 🎯 STEP 4: Update Environment Variables (3 minutes)

The services need to know each other's URLs.

### 4.1 Update Backend

1. Go to Render Dashboard
2. Click on **"blood-cancer-backend"** service
3. Click **"Environment"** tab (left sidebar)
4. Update these variables:

```
FRONTEND_URL = https://blood-cancer-frontend.onrender.com
ML_SERVICE_URL = https://blood-cancer-ml-service.onrender.com
```

5. Click **"Save Changes"**
6. Backend will auto-redeploy (2 min)

### 4.2 Update Frontend

1. Click on **"blood-cancer-frontend"** service
2. Click **"Environment"** tab
3. Update this variable:

```
VITE_API_URL = https://blood-cancer-backend.onrender.com
```

4. Click **"Save Changes"**
5. Frontend will auto-redeploy (2 min)

---

## 🎯 STEP 5: Test Your Deployment (2 minutes)

### 5.1 Check Health Endpoints

Open these URLs in browser:

**Backend Health:**
```
https://blood-cancer-backend.onrender.com/health
```
Should show: `{"status":"OK"}`

**ML Service Health:**
```
https://blood-cancer-ml-service.onrender.com/health
```
Should show: `{"status":"degraded","models":{"bccd":false,"efficientnet":false}}`

**Note:** ML service shows "degraded" because weights are missing. That's OK for now!

### 5.2 Test Web Application

1. Open your frontend URL:
   ```
   https://blood-cancer-frontend.onrender.com
   ```

2. You should see the login page

3. Login with demo account:
   - **Email:** priya.sharma@citygeneral.com
   - **Password:** password123

4. Dashboard should load ✅

**Note:** Image upload will work, but predictions will fail until you add model weights.

---

## 🎯 STEP 6: Add Model Weights (Later)

You can deploy now and add weights later when you get them.

### Option A: Upload to Google Drive

1. Get the 2 `.pth` files from your team
2. Upload to Google Drive
3. Get shareable links (Anyone with link can view)
4. Convert to direct download links:
   - Original: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
   - Direct: `https://drive.google.com/uc?export=download&id=FILE_ID`

5. Update `ml-service/app/main.py` to download weights on startup:

```python
import os
import requests
from pathlib import Path

# Add this at the top of main.py, before model loading
WEIGHTS_DIR = Path("weights")
WEIGHTS_DIR.mkdir(exist_ok=True)

WEIGHTS = {
    "best_resnet50_bloodcells.pth": "YOUR_GOOGLE_DRIVE_DIRECT_LINK_1",
    "best_efficientnetb0_bloodcells.pth": "YOUR_GOOGLE_DRIVE_DIRECT_LINK_2"
}

def download_weights():
    for filename, url in WEIGHTS.items():
        filepath = WEIGHTS_DIR / filename
        if not filepath.exists():
            print(f"Downloading {filename}...")
            response = requests.get(url, stream=True, timeout=300)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Downloaded {filename}")

# Call before app starts
download_weights()
```

6. Commit and push:
```bash
git add ml-service/app/main.py
git commit -m "Add weight download logic"
git push
```

7. Render will auto-redeploy ML service

### Option B: Use Render Disk (Paid - $7/month)

1. Add persistent disk to ML service
2. Upload weights manually via Render shell
3. Mount disk at `/app/weights`

---

## 🎯 STEP 7: Keep Services Awake (5 minutes)

Render free tier sleeps after 15 minutes of inactivity.

### Use Cron-Job.org (Free)

1. Go to https://cron-job.org
2. Sign up (free)
3. Create 2 cron jobs:

**Job 1: Backend**
- Title: Blood Cancer Backend
- URL: `https://blood-cancer-backend.onrender.com/health`
- Schedule: Every 10 minutes
- Method: GET
- Enable: Yes

**Job 2: ML Service**
- Title: Blood Cancer ML
- URL: `https://blood-cancer-ml-service.onrender.com/health`
- Schedule: Every 10 minutes
- Method: GET
- Enable: Yes

4. Click "Create" for both jobs

**Done!** Your services will stay awake.

---

## ✅ DEPLOYMENT COMPLETE!

Your application is now live at:

🌐 **https://blood-cancer-frontend.onrender.com**

---

## 📊 What You Have Now

| Feature | Status |
|---------|--------|
| Frontend deployed | ✅ |
| Backend deployed | ✅ |
| ML Service deployed | ✅ |
| Database created | ✅ |
| Demo accounts working | ✅ |
| Login working | ✅ |
| Dashboard working | ✅ |
| Image upload working | ✅ |
| ML predictions | ⏳ (needs weights) |

---

## 🔧 Next Steps

### Immediate
- [x] Test login
- [x] Explore dashboard
- [x] Try uploading images (won't predict yet)

### When You Get Model Weights
- [ ] Upload to Google Drive
- [ ] Add download logic to ML service
- [ ] Push code update
- [ ] Test predictions

### Optional
- [ ] Set up custom domain
- [ ] Add more demo users
- [ ] Configure email notifications
- [ ] Add monitoring/analytics

---

## 💰 Cost Breakdown

| Service | Cost | Details |
|---------|------|---------|
| **Render (3 services)** | $0/month | 750 hours each |
| **Cron-Job.org** | $0/month | Unlimited jobs |
| **GitHub** | $0/month | Free for public/private repos |
| **Total** | **$0/month** | 100% FREE! |

**Limitations:**
- Services sleep after 15 min (30s wake-up)
- 512 MB RAM per service
- Shared CPU

**To upgrade (optional):**
- $7/month per service for always-on
- Recommended: Upgrade backend + ML ($14/month)

---

## 🆘 Troubleshooting

### Frontend shows blank page
- Check browser console (F12)
- Verify VITE_API_URL is correct
- Clear browser cache

### Backend errors
- Check logs in Render dashboard
- Verify ML_SERVICE_URL is correct
- Check database migrations ran

### ML Service degraded
- Normal without model weights
- Will show "healthy" after adding weights

### Services are slow
- First request after sleep takes 30-60s
- Set up cron jobs to keep awake
- Consider upgrading to paid tier

### CORS errors
- Update FRONTEND_URL in backend
- Redeploy backend
- Clear browser cache

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Your Docs:** See `DEPLOYMENT.md` for more details

---

## 🎉 Success Checklist

- [x] Code pushed to GitHub
- [x] All 3 services deployed on Render
- [x] Environment variables updated
- [x] Health checks passing
- [x] Can access frontend
- [x] Can login with demo account
- [x] Dashboard loads
- [x] Cron jobs set up
- [ ] Model weights added (when available)

---

## 📝 Your Deployment Info

**Save this information:**

```
Frontend URL: https://blood-cancer-frontend.onrender.com
Backend URL: https://blood-cancer-backend.onrender.com
ML Service URL: https://blood-cancer-ml-service.onrender.com

Demo Login:
Email: priya.sharma@citygeneral.com
Password: password123

Deployment Date: _______________
GitHub Repo: https://github.com/YOUR_USERNAME/blood-cancer-detection
```

---

## 🚀 You're Live!

Your Blood Cancer Detection System is now deployed and accessible worldwide!

**Share your frontend URL with your team and start using it!**

**When you get model weights, follow Step 6 to enable predictions.**

---

## Alternative: Deploy Without render.yaml

If render.yaml doesn't work, deploy services individually:

### Deploy ML Service
1. New + → Web Service
2. Connect repository
3. Root Directory: `ml-service`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Deploy Backend
1. New + → Web Service
2. Connect repository
3. Root Directory: `Backend`
4. Build Command: `npm ci && npx prisma generate && npx prisma migrate deploy`
5. Start Command: `node src/server.js`
6. Add Disk: 1GB at `/app/prisma`

### Deploy Frontend
1. New + → Static Site
2. Connect repository
3. Root Directory: `Frontend`
4. Build Command: `npm ci && npm run build`
5. Publish Directory: `dist`

Then update environment variables as described in Step 4.

---

**Good luck with your deployment! 🎉**

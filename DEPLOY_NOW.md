# 🚀 FREE DEPLOYMENT - QUICK STEPS

## 3 Steps to Deploy Everything for FREE

---

## STEP 1: Push to GitHub (2 min)

```bash
cd "C:\Users\Akshat\IBM Project"
git init
git add .
git commit -m "Deploy Blood Cancer Detection"
git remote add origin https://github.com/YOUR_USERNAME/blood-cancer-detection.git
git push -u origin main
```

---

## STEP 2: Deploy on Render (10 min)

1. Go to https://dashboard.render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Blueprint"**
4. Select your repository
5. Click **"Apply"**
6. Wait 10 minutes ⏳

---

## STEP 3: Update URLs (3 min)

### Backend Environment:
```
FRONTEND_URL = https://blood-cancer-frontend.onrender.com
ML_SERVICE_URL = https://blood-cancer-ml-service.onrender.com
```

### Frontend Environment:
```
VITE_API_URL = https://blood-cancer-backend.onrender.com
```

Click "Save Changes" for each.

---

## ✅ DONE!

Your app is live at:
**https://blood-cancer-frontend.onrender.com**

Login: `priya.sharma@citygeneral.com` / `password123`

---

## 📝 Notes

- **Cost:** $0/month (100% FREE)
- **ML Predictions:** Won't work until you add model weights
- **Everything else:** Works perfectly!

---

## 🔧 Add Model Weights Later

When you get the `.pth` files:
1. Upload to Google Drive
2. Add download code to `ml-service/app/main.py`
3. Push to GitHub
4. Render auto-deploys

See `FREE_DEPLOYMENT_COMPLETE.md` for details.

---

## 🆘 Keep Services Awake

Set up free cron jobs at https://cron-job.org:
- Ping backend every 10 min
- Ping ML service every 10 min

---

**Full Guide:** `FREE_DEPLOYMENT_COMPLETE.md`

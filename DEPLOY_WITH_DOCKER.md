# 🚀 DEPLOY ALL SERVICES WITH DOCKER - COMPLETE GUIDE

Deploy Frontend, Backend, ML Service using Docker images on Railway.

---

## 🎯 **OPTION 1: RAILWAY (EASIEST - AUTO DOCKER COMPOSE)**

Railway automatically reads your `docker-compose.yml` and deploys everything!

### **Step 1: Push Code to GitHub**

```powershell
cd "C:\Users\Akshat\IBM Project"
git add .
git commit -m "Deploy with Docker on Railway"
git push origin main
```

---

### **Step 2: Sign Up for Railway**

1. Go to: **https://railway.app**
2. Click **"Login"**
3. Click **"Login with GitHub"**
4. Authorize Railway
5. You'll see Railway Dashboard

---

### **Step 3: Create New Project**

1. Click **"New Project"** button
2. Click **"Deploy from GitHub repo"**
3. Select **"blood-cancer-cell-detection"**
4. Railway will scan your repository

**Railway detects:**
- ✅ `docker-compose.yml` found
- ✅ 3 services detected (frontend, backend, ml-service)
- ✅ Dockerfiles found for each service

---

### **Step 4: Railway Auto-Creates Services**

Railway automatically creates 3 services:

**You'll see 3 cards:**
1. **frontend** (from Frontend/Dockerfile)
2. **backend** (from Backend/Dockerfile)
3. **ml-service** (from ml-service/Dockerfile)

**Railway automatically:**
- Builds Docker images
- Deploys containers
- Assigns public URLs
- Sets up networking

---

### **Step 5: Configure Environment Variables**

Click on each service to add variables:

#### **ML Service:**
Click on "ml-service" card → Variables tab

```
PYTHONUNBUFFERED = 1
PORT = 8000
```

#### **Backend:**
Click on "backend" card → Variables tab

```
NODE_ENV = production
PORT = 3001
DATABASE_URL = file:./prisma/dev.db
JWT_SECRET = blood-cancer-railway-secret-2024
BCRYPT_ROUNDS = 12
ML_SERVICE_URL = ${{ml-service.RAILWAY_PRIVATE_DOMAIN}}:8000
FRONTEND_URL = https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
```

**Note:** Railway auto-fills `${{service.RAILWAY_PUBLIC_DOMAIN}}` with actual URLs

#### **Frontend:**
Click on "frontend" card → Variables tab

```
VITE_API_URL = https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

---

### **Step 6: Add Volume for Backend Database**

1. Click on **"backend"** service
2. Go to **"Volumes"** tab
3. Click **"New Volume"**
4. Mount Path: `/app/prisma`
5. Click **"Add"**

---

### **Step 7: Deploy!**

Railway deploys automatically after configuration.

**Watch deployment logs:**
- Click on each service
- Go to "Deployments" tab
- Watch build logs in real-time

**Deployment takes 5-10 minutes for all 3 services**

---

### **Step 8: Get Your URLs**

After deployment completes:

**ML Service:**
- Click on "ml-service"
- Go to "Settings" → "Domains"
- Copy URL: `https://blood-cancer-ml-production.up.railway.app`

**Backend:**
- Click on "backend"
- Go to "Settings" → "Domains"
- Copy URL: `https://blood-cancer-backend-production.up.railway.app`

**Frontend:**
- Click on "frontend"
- Go to "Settings" → "Domains"
- Copy URL: `https://blood-cancer-frontend-production.up.railway.app`

---

### **Step 9: Test Your Deployment**

Open frontend URL in browser:
```
https://blood-cancer-frontend-production.up.railway.app
```

Login with:
- Email: `priya.sharma@citygeneral.com`
- Password: `password123`

✅ **All services deployed with Docker!**

---

## 🎯 **OPTION 2: RENDER (DOCKER SUPPORT)**

Render also supports Docker, but you need to deploy each service separately.

### **Deploy ML Service with Docker:**

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect repository
4. Configure:

```
Name: blood-cancer-ml-service
Region: Singapore
Branch: main
Root Directory: ml-service
Environment: Docker  ← Select Docker
Dockerfile Path: Dockerfile
Docker Command: (leave empty - uses CMD from Dockerfile)
Instance Type: Free
```

5. Environment Variables:
```
PYTHONUNBUFFERED = 1
```

6. Click **"Create Web Service"**

### **Deploy Backend with Docker:**

Same process:
```
Name: blood-cancer-backend
Root Directory: Backend
Environment: Docker
```

Add Volume:
- Mount Path: `/app/prisma`
- Size: 1 GB

### **Deploy Frontend with Docker:**

```
Name: blood-cancer-frontend
Root Directory: Frontend
Environment: Docker
```

---

## 🎯 **OPTION 3: FLY.IO (DOCKER NATIVE)**

Fly.io is built for Docker deployments.

### **Install Fly CLI:**

```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### **Deploy ML Service:**

```powershell
cd "C:\Users\Akshat\IBM Project\ml-service"
fly launch --name blood-cancer-ml --dockerfile Dockerfile
fly deploy
```

### **Deploy Backend:**

```powershell
cd ../Backend
fly launch --name blood-cancer-backend --dockerfile Dockerfile
fly volumes create backend_data --size 1 --region ord
fly deploy
```

### **Deploy Frontend:**

```powershell
cd ../Frontend
fly launch --name blood-cancer-frontend --dockerfile Dockerfile
fly deploy
```

---

## 🎯 **OPTION 4: GOOGLE CLOUD RUN (DOCKER)**

Google Cloud Run is serverless Docker container platform.

### **Install Google Cloud CLI:**

1. Download: https://cloud.google.com/sdk/docs/install
2. Install and authenticate

### **Deploy Services:**

```powershell
# ML Service
cd "C:\Users\Akshat\IBM Project\ml-service"
gcloud run deploy blood-cancer-ml --source . --region asia-southeast1

# Backend
cd ../Backend
gcloud run deploy blood-cancer-backend --source . --region asia-southeast1

# Frontend
cd ../Frontend
gcloud run deploy blood-cancer-frontend --source . --region asia-southeast1
```

**Free tier:** 2 million requests/month

---

## 🎯 **OPTION 5: AWS (ECS with Docker)**

Deploy Docker containers on AWS ECS.

### **Requirements:**
- AWS Account
- AWS CLI installed
- Docker images pushed to ECR

**More complex but production-ready**

---

## 💰 **COST COMPARISON**

| Platform | Free Tier | Docker Support | Ease |
|----------|-----------|----------------|------|
| **Railway** | $5 credit | ✅ Native | ⭐⭐⭐⭐⭐ |
| **Render** | 750h/month | ✅ Yes | ⭐⭐⭐⭐ |
| **Fly.io** | 3 VMs | ✅ Native | ⭐⭐⭐ |
| **Google Cloud Run** | 2M requests | ✅ Native | ⭐⭐⭐ |
| **AWS ECS** | 12 months | ✅ Native | ⭐⭐ |

---

## 🏆 **RECOMMENDED: RAILWAY**

**Why Railway is best for your project:**

1. ✅ **Auto-detects docker-compose.yml**
2. ✅ **Deploys all 3 services at once**
3. ✅ **Uses your existing Dockerfiles**
4. ✅ **Handles networking automatically**
5. ✅ **$5 free credit (≈500 hours)**
6. ✅ **Easiest setup (5 minutes)**

---

## 🚀 **QUICK START: RAILWAY**

```powershell
# 1. Push to GitHub
git push origin main

# 2. Go to Railway
# https://railway.app

# 3. Login with GitHub

# 4. Click "New Project" → "Deploy from GitHub repo"

# 5. Select your repository

# 6. Railway auto-deploys everything!

# 7. Done! ✅
```

---

## 📝 **WHAT GETS DEPLOYED**

### **ML Service (Docker):**
- Uses: `ml-service/Dockerfile`
- Image: Python 3.11 + PyTorch
- Port: 8000
- Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### **Backend (Docker):**
- Uses: `Backend/Dockerfile`
- Image: Node 18 Alpine
- Port: 3001
- Command: Runs migrations + seeds + starts server
- Volume: Persistent SQLite database

### **Frontend (Docker):**
- Uses: `Frontend/Dockerfile`
- Image: Node 18 (build) + Nginx (serve)
- Port: 80
- Serves: Static React build

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] Code pushed to GitHub
- [ ] Signed up for Railway
- [ ] Created new project from GitHub repo
- [ ] Railway detected docker-compose.yml
- [ ] All 3 services created automatically
- [ ] Environment variables configured
- [ ] Backend volume added
- [ ] All services deployed successfully
- [ ] URLs obtained for each service
- [ ] Application tested and working

---

## 🆘 **TROUBLESHOOTING**

### **Railway doesn't detect docker-compose.yml**
- Ensure file is in root directory
- Check file name is exactly `docker-compose.yml`
- Push latest code to GitHub

### **Docker build fails**
- Check Dockerfile syntax
- Ensure all files are in correct directories
- Check build logs for specific errors

### **Services can't communicate**
- Use Railway's internal URLs: `${{service.RAILWAY_PRIVATE_DOMAIN}}`
- Don't use localhost or 127.0.0.1

### **Frontend can't reach backend**
- Update `VITE_API_URL` with backend's public URL
- Redeploy frontend after changing env vars

---

## 🎉 **RESULT**

After deployment, you'll have:

✅ **3 Docker containers running in the cloud**
✅ **Public URLs for each service**
✅ **Automatic HTTPS**
✅ **Persistent database**
✅ **Auto-scaling**
✅ **Zero server management**

---

## 📞 **NEXT STEPS**

1. **Deploy on Railway** (easiest)
2. **Test all features**
3. **Add model weights** (when available)
4. **Set up custom domain** (optional)
5. **Monitor usage and costs**

---

**Ready to deploy? Go to https://railway.app and start!** 🚀

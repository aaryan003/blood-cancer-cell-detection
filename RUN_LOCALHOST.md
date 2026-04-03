# 🏠 Run on Localhost - Quick Guide

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Model weights in `ml-service/weights/` folder
- ✅ `.env` file configured

---

## 🚀 Quick Start (2 Commands)

### Step 1: Update JWT Secret (Important!)

Open `.env` file and change the JWT_SECRET:

```env
JWT_SECRET=your-super-secret-key-here-change-this
```

### Step 2: Start Everything

```bash
cd "c:\Users\Akshat\IBM Project"
docker-compose up --build
```

That's it! Wait 2-3 minutes for build and startup.

---

## 🌐 Access Your Application

Once you see "Server running on port 3001" in the logs:

| Service | URL |
|---------|-----|
| **Web App** | http://localhost |
| **Backend API** | http://localhost:3001 |
| **ML Service** | http://localhost:8000 |
| **Health Check** | http://localhost:3001/health |

---

## 🔐 Login with Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| priya.sharma@citygeneral.com | password123 | Doctor |
| arjun.mehta@admin.com | password123 | Admin |
| vikram.patel@citygeneral.com | password123 | Lab Tech |

---

## 🛑 Stop Everything

Press `Ctrl+C` in the terminal, then:

```bash
docker-compose down
```

---

## 🔄 Common Commands

### Start in background (detached mode)
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### View logs for specific service
```bash
docker-compose logs -f backend
docker-compose logs -f ml-service
docker-compose logs -f frontend
```

### Restart after code changes
```bash
docker-compose up --build
```

### Stop and remove everything (including database)
```bash
docker-compose down -v
```

### Check service status
```bash
docker-compose ps
```

---

## ⚠️ Troubleshooting

### Port 80 already in use?

**Option 1: Change port in `.env`**
```env
FRONTEND_PORT=3000
```
Then access at: http://localhost:3000

**Option 2: Stop conflicting service**
```bash
# Find what's using port 80
netstat -ano | findstr :80

# Stop the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Model weights missing?

Ensure these files exist:
```
ml-service/weights/best_resnet50_bloodcells.pth
ml-service/weights/best_efficientnetb0_bloodcells.pth
```

If missing, the ML service will start but predictions will fail.

### Database not seeding?

```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

### Docker not starting?

1. Open Docker Desktop
2. Ensure Docker is running (whale icon in system tray)
3. Try restarting Docker Desktop

---

## 📊 What's Running?

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
│                                         │
│  ┌──────────────┐                      │
│  │   Frontend   │  http://localhost    │
│  │  (Nginx:80)  │                      │
│  └──────┬───────┘                      │
│         │                               │
│         ▼                               │
│  ┌──────────────┐                      │
│  │   Backend    │  http://localhost:3001│
│  │(Express:3001)│                      │
│  └──────┬───────┘                      │
│         │                               │
│         ▼                               │
│  ┌──────────────┐                      │
│  │  ML Service  │  http://localhost:8000│
│  │(FastAPI:8000)│                      │
│  └──────────────┘                      │
│                                         │
│  Database: SQLite (persisted in volume)│
└─────────────────────────────────────────┘
```

---

## 🎯 Development Workflow

### 1. Make code changes

Edit files in `Frontend/`, `Backend/`, or `ml-service/`

### 2. Rebuild and restart

```bash
docker-compose up --build
```

### 3. Test changes

Open http://localhost in browser

### 4. View logs if issues

```bash
docker-compose logs -f
```

---

## 🔧 Advanced: Run Services Individually (Without Docker)

If you want to run services separately for development:

### Backend
```bash
cd Backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```
Access at: http://localhost:3001

### Frontend
```bash
cd Frontend
npm install
npm run dev
```
Access at: http://localhost:5173

### ML Service
```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Access at: http://localhost:8000

**Note:** You'll need to update environment variables for each service to point to the correct URLs.

---

## 📝 Environment Variables Explained

Your `.env` file controls the configuration:

```env
# Ports (change if conflicts)
FRONTEND_PORT=80
BACKEND_PORT=3001
ML_PORT=8000

# Security (MUST change in production!)
JWT_SECRET=your-secret-key-here
BCRYPT_ROUNDS=12

# Optional CAPTCHA
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

---

## ✅ Verification Checklist

After starting, verify:

- [ ] Docker Desktop is running
- [ ] All 3 containers are running: `docker-compose ps`
- [ ] Frontend loads: http://localhost
- [ ] Backend health: http://localhost:3001/health
- [ ] ML health: http://localhost:8000/health
- [ ] Can login with demo account
- [ ] Can upload image
- [ ] Can run prediction

---

## 🎉 Success!

If you can:
1. ✅ Access http://localhost
2. ✅ Login with demo account
3. ✅ Upload blood cell image
4. ✅ Get prediction results

**Your system is working perfectly!**

---

## 🆘 Still Having Issues?

### Check Docker logs
```bash
docker-compose logs -f
```

### Restart Docker Desktop
1. Right-click Docker icon in system tray
2. Click "Restart Docker Desktop"
3. Wait 1-2 minutes
4. Try `docker-compose up` again

### Reset everything
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Check system resources
- Ensure you have at least 4GB RAM available
- Ensure you have at least 5GB disk space
- Close other heavy applications

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `docker-compose up` | Start all services |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View logs |
| `docker-compose ps` | Check status |
| `docker-compose restart` | Restart all |
| `docker-compose up --build` | Rebuild and start |

---

**That's it! Your application is now running on localhost.** 🚀

# 🔧 Troubleshooting: "Not Found" Error

## What This Error Means

The `{"detail": "Not Found"}` error means:
- The ML service is running
- But the endpoint you're trying to access doesn't exist
- Or the URL path is incorrect

---

## Quick Fixes

### 1. Check ML Service is Running

Open in browser: **http://localhost:8000/health**

**Expected response:**
```json
{
  "status": "healthy",
  "models": {
    "bccd": true,
    "efficientnet": true
  }
}
```

**If you get "Not Found" here:**
- ML service isn't running properly
- Check Docker logs: `docker-compose logs ml-service`

---

### 2. Check Available Endpoints

The ML service has only 2 endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/predict` | POST | Image prediction |

**Root URL (/) is NOT available** - that's why you get "Not Found"

---

### 3. Test ML Service Directly

Open PowerShell and test:

```powershell
# Test health endpoint
curl http://localhost:8000/health

# Test predict endpoint (with a test image)
curl -X POST "http://localhost:8000/predict?model=bccd" `
  -F "file=@path\to\your\image.jpg"
```

---

### 4. Check Docker Logs

```bash
# View ML service logs
docker-compose logs -f ml-service

# Look for these messages:
# ✓ "Model 'bccd' loaded OK."
# ✓ "Model 'efficientnet' loaded OK."
# ✓ "Startup complete. Loaded models: ['bccd', 'efficientnet']"
```

---

## Common Causes

### Cause 1: Accessing Wrong URL

❌ **Wrong:**
```
http://localhost:8000/
http://localhost:8000/api/predict
http://localhost:8000/docs
```

✅ **Correct:**
```
http://localhost:8000/health
http://localhost:8000/predict
```

---

### Cause 2: Model Weights Missing

If logs show:
```
Model 'bccd' weights not found
Model 'efficientnet' weights not found
```

**Solution:**
1. Check if weights exist:
   ```
   ml-service/weights/best_resnet50_bloodcells.pth
   ml-service/weights/best_efficientnetb0_bloodcells.pth
   ```

2. If missing, get the weights from your team

3. Restart Docker:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

---

### Cause 3: Port Conflict

Another service might be using port 8000.

**Check:**
```bash
netstat -ano | findstr :8000
```

**Solution:**
Change ML_PORT in `.env`:
```env
ML_PORT=8001
```

Then restart:
```bash
docker-compose down
docker-compose up --build
```

---

### Cause 4: Backend Can't Reach ML Service

If error happens when uploading from frontend:

**Check Backend Logs:**
```bash
docker-compose logs -f backend
```

Look for:
```
ML service unreachable: connect ECONNREFUSED
```

**Solution:**
Backend environment variable might be wrong. Check `docker-compose.yml`:
```yaml
environment:
  - ML_SERVICE_URL=http://ml-service:8000
```

Should use Docker service name `ml-service`, not `localhost`.

---

## Step-by-Step Diagnosis

### Step 1: Verify All Services Running

```bash
docker-compose ps
```

Should show:
```
NAME                STATUS
frontend            Up
backend             Up
ml-service          Up
```

---

### Step 2: Test Each Service

**ML Service:**
```bash
curl http://localhost:8000/health
```

**Backend:**
```bash
curl http://localhost:3001/health
```

**Frontend:**
Open browser: http://localhost

---

### Step 3: Check Logs for Errors

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs ml-service
```

---

### Step 4: Test Full Flow

1. Open http://localhost
2. Login with: `priya.sharma@citygeneral.com` / `password123`
3. Upload a blood cell image
4. Select model (bccd or efficientnet)
5. Click "Run Prediction"

**If error occurs:**
- Open browser DevTools (F12)
- Go to Network tab
- Check which request failed
- Look at the request URL and response

---

## Complete Reset (Nuclear Option)

If nothing works, reset everything:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all Docker images
docker system prune -a

# Rebuild from scratch
docker-compose up --build
```

This takes 5-10 minutes but fixes most issues.

---

## Specific Error Messages

### "detail": "Not Found"
- You're accessing a URL that doesn't exist
- Check the endpoint path
- ML service only has `/health` and `/predict`

### "detail": "Model not available"
- Model weights not loaded
- Check `ml-service/weights/` folder
- Check ML service logs

### "ML service unreachable"
- Backend can't connect to ML service
- Check ML service is running
- Check ML_SERVICE_URL environment variable

### "ML service timed out"
- Prediction took > 15 seconds
- Model might be too slow
- Check ML service logs for errors

---

## Get More Information

### View FastAPI Docs (if enabled)

FastAPI has automatic documentation. To enable:

1. Edit `ml-service/app/main.py`
2. Add `docs_url="/docs"` to FastAPI initialization
3. Restart: `docker-compose restart ml-service`
4. Open: http://localhost:8000/docs

---

## Still Not Working?

### Collect Debug Information

```bash
# 1. Check Docker status
docker-compose ps

# 2. Get all logs
docker-compose logs > debug-logs.txt

# 3. Check environment variables
docker-compose config

# 4. Test ML service directly
curl -v http://localhost:8000/health
```

### Check These Files

1. `.env` - Environment variables
2. `docker-compose.yml` - Service configuration
3. `ml-service/app/main.py` - ML service endpoints
4. `Backend/src/modules/predict/predict.service.js` - Backend ML client

---

## Quick Reference

| What You're Doing | Correct URL |
|-------------------|-------------|
| Health check ML service | http://localhost:8000/health |
| Predict via ML service | http://localhost:8000/predict |
| Health check backend | http://localhost:3001/health |
| Upload via backend | http://localhost:3001/api/upload/sample |
| Predict via backend | http://localhost:3001/api/predict |
| Access web app | http://localhost |

---

## Prevention

To avoid this error:
- ✅ Always check `/health` endpoint first
- ✅ Verify model weights are present
- ✅ Check Docker logs before testing
- ✅ Use correct endpoint paths
- ✅ Test services individually before integration

---

**Most Common Solution:**

The error usually means you're trying to access the root URL `/` which doesn't exist.

**Use `/health` or `/predict` instead.**

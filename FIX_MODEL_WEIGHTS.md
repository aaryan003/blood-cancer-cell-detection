# ⚠️ FIX: Model Weights Missing

## Problem

Your ML service shows:
```json
{"status":"degraded","models":{"bccd":false,"efficientnet":false}}
```

This means the model weight files are **missing** from `ml-service/weights/` folder.

---

## Solution: Add Model Weights

You need these 2 files in `ml-service/weights/`:

```
ml-service/weights/best_resnet50_bloodcells.pth        (~90 MB)
ml-service/weights/best_efficientnetb0_bloodcells.pth  (~16 MB)
```

---

## Option 1: Get Weights from Your Team

**Ask your teammate** who trained the models to share the `.pth` files via:
- Google Drive
- OneDrive
- USB drive
- Any file sharing service

**Then:**
1. Download the 2 `.pth` files
2. Copy them to: `C:\Users\Akshat\IBM Project\ml-service\weights\`
3. Restart Docker:
   ```bash
   docker-compose restart ml-service
   ```
4. Test: `curl http://localhost:8000/health`

---

## Option 2: Train Models Yourself (Takes Time)

If you have the training notebooks in `Backend/ML_Models/`:

1. Open the notebooks:
   - `BCCD_MODEL.ipynb` (ResNet50)
   - `BCCD_MODEL_EFFICIENTNET.ipynb` (EfficientNet)

2. Run all cells to train models

3. Export the trained models as `.pth` files

4. Copy to `ml-service/weights/`

**Note:** Training takes hours and requires GPU.

---

## Option 3: Use Pre-trained Weights (If Available)

If your project has a backup or archive:

1. Check project documentation for weight download links
2. Check if weights are in Git LFS
3. Check team shared drive

---

## Verify Weights Are Loaded

After adding weights:

```bash
# Restart ML service
docker-compose restart ml-service

# Check logs
docker-compose logs ml-service

# Should see:
# "Model 'bccd' loaded OK."
# "Model 'efficientnet' loaded OK."

# Test health endpoint
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","models":{"bccd":true,"efficientnet":true}}
```

---

## Expected File Structure

```
ml-service/
  weights/
    best_resnet50_bloodcells.pth        ← Add this file
    best_efficientnetb0_bloodcells.pth  ← Add this file
  app/
    main.py
    models.py
    inference.py
    ...
```

---

## Quick Test After Fix

1. **Check health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should show: `"status":"healthy"`

2. **Test prediction:**
   ```bash
   curl -X POST "http://localhost:8000/predict?model=bccd" ^
     -F "file=@path\to\test\image.jpg"
   ```

3. **Use web app:**
   - Open http://localhost
   - Login and upload image
   - Should work now!

---

## Why Weights Are Missing

Model weights are **gitignored** because:
- They're too large for Git (106 MB total)
- Binary files don't belong in version control
- Each developer needs to get them separately

This is normal for ML projects.

---

## Contact Your Team

**Ask:** "Can you share the model weight files?"

**They need to send you:**
- `best_resnet50_bloodcells.pth`
- `best_efficientnetb0_bloodcells.pth`

**Tell them:** "Put them in `ml-service/weights/` folder"

---

## Once You Have Weights

1. Copy files to `ml-service/weights/`
2. Restart: `docker-compose restart ml-service`
3. Verify: `curl http://localhost:8000/health`
4. Should show: `"status":"healthy"`
5. ✅ Done!

---

**Without these weight files, the ML service cannot make predictions.**

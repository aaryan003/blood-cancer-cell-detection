# 🔧 FIX: CAPTCHA Not Loading

## Problem
CAPTCHA shows "Loading CAPTCHA..." but never loads the question.

---

## Quick Test

Open browser console (F12) and check for errors when on login page.

**Common errors:**
- `Failed to fetch`
- `CORS error`
- `net::ERR_CONNECTION_REFUSED`

---

## Solution 1: Check Backend is Running

```bash
# Test CAPTCHA endpoint directly
curl http://localhost:3001/api/captcha
```

**Expected response:**
```json
{
  "success": true,
  "captcha": {
    "token": "abc123...",
    "question": "What is 5 + 3?"
  }
}
```

**If this works, backend is fine. Issue is frontend connection.**

---

## Solution 2: Check Frontend API URL

The frontend needs to know where the backend is.

### For Localhost (Docker):

Frontend is configured to call backend through nginx proxy at `/api/*`

**Check `Frontend/nginx.conf`:**
```nginx
location /api/ {
    proxy_pass http://backend:3001/api/;
    ...
}
```

This should already be correct in your setup.

---

## Solution 3: Bypass CAPTCHA (Temporary Fix)

If CAPTCHA keeps failing, you can temporarily disable it:

### Update Backend Auth Routes

Edit `Backend/src/modules/auth/auth.routes.js`:

Find the login route and remove CAPTCHA validation:

**Before:**
```javascript
router.post('/login', validateCaptcha, authController.login);
```

**After:**
```javascript
router.post('/login', authController.login);
```

Then rebuild:
```bash
docker-compose down
docker-compose up --build
```

Now you can login without CAPTCHA.

---

## Solution 4: Make CAPTCHA Optional

Update `Frontend/src/components/LoginPage.tsx`:

Change the validation to make CAPTCHA optional:

**Find this line (around line 60):**
```typescript
if (captcha && !captchaAnswer.trim()) {
  setError("Please answer the CAPTCHA question");
  return false;
}
```

**Change to:**
```typescript
// CAPTCHA is optional - skip validation if not loaded
if (captcha && captchaAnswer.trim() && isNaN(parseInt(captchaAnswer))) {
  setError("Please enter a valid number for CAPTCHA");
  return false;
}
```

**And update the submit handler (around line 75):**
```typescript
const result = await authService.login({
  email: formData.email.trim().replace(/^mailto:/, '').toLowerCase(),
  password: formData.password,
  // Only send CAPTCHA if it loaded successfully
  ...(captcha && captchaAnswer ? { 
    captchaToken: captcha.token, 
    captchaAnswer: captchaAnswer 
  } : {})
});
```

---

## Solution 5: Check Docker Network

Ensure all containers are on the same network:

```bash
docker network ls
docker network inspect ibm-project_app-network
```

All 3 services should be listed.

---

## Solution 6: Test CAPTCHA from Browser

Open browser console (F12) and run:

```javascript
fetch('http://localhost:3001/api/captcha')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e));
```

**If this works:** Frontend configuration issue  
**If this fails:** Backend or CORS issue

---

## Solution 7: Update Frontend to Call Backend Directly

If nginx proxy isn't working, update frontend to call backend directly:

Edit `Frontend/src/constants/index.ts`:

```typescript
export const APP_CONFIG = {
  name: 'Blood Cancer Cell Detection System',
  version: '1.0.0',
  apiUrl: 'http://localhost:3001', // Direct backend URL
};
```

Rebuild:
```bash
docker-compose down
docker-compose up --build
```

---

## Quick Fix: Login Without CAPTCHA

You can login without waiting for CAPTCHA:

1. Open browser console (F12)
2. Go to login page
3. Fill email and password
4. Run this in console:

```javascript
// Bypass CAPTCHA validation
document.querySelector('form').addEventListener('submit', (e) => {
  e.stopImmediatePropagation();
}, true);
```

4. Click "Sign In"

---

## Permanent Fix: Remove CAPTCHA Requirement

### Backend:
Edit `Backend/src/modules/auth/auth.routes.js`:

```javascript
import express from 'express';
import { authController } from './auth.controller.js';
// Remove: import { validateCaptcha } from '../../captcha.js';

const router = express.Router();

router.post('/signup', authController.signup); // No CAPTCHA
router.post('/login', authController.login);   // No CAPTCHA
router.get('/profile', authController.getProfile);

export default router;
```

### Frontend:
Edit `Frontend/src/components/LoginPage.tsx`:

Remove CAPTCHA section (lines 150-175):

```typescript
// DELETE THIS ENTIRE SECTION:
{/* CAPTCHA Field */}
<div className="space-y-2">
  {captcha ? (
    // ... entire CAPTCHA UI
  ) : (
    // ... loading spinner
  )}
</div>
```

Rebuild:
```bash
docker-compose down
docker-compose up --build
```

---

## Test After Fix

1. Open http://localhost
2. Should see login page
3. No CAPTCHA field (if removed)
4. Login with: `priya.sharma@citygeneral.com` / `password123`
5. Should work!

---

## Why This Happens

**Common causes:**
1. Frontend can't reach backend (network issue)
2. CORS blocking the request
3. Backend not responding to `/api/captcha`
4. Nginx proxy misconfigured

**The quickest fix is to remove CAPTCHA requirement entirely.**

---

## Recommended: Remove CAPTCHA for Now

CAPTCHA is optional for this project. You can:
1. Remove it completely (easiest)
2. Fix it later when deploying to production
3. Use Google reCAPTCHA instead (more reliable)

**For local development and testing, CAPTCHA is not necessary.**

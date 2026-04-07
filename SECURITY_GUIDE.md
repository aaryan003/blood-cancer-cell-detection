# 🔐 SECURITY GUIDE - COMPLETE SETUP

## Current Security Status

✅ **Already Secure:**
- `.env` files are gitignored
- Passwords are hashed with bcrypt
- JWT authentication implemented
- Rate limiting enabled
- Helmet.js security headers
- CORS configured
- Input validation with express-validator
- File upload security

⚠️ **Needs Attention:**
- JWT secret should be stronger
- Add HTTPS enforcement
- Add security headers
- Implement API key rotation
- Add request logging
- Add brute force protection

---

## 🔒 STEP 1: SECURE ENVIRONMENT VARIABLES

### Check What's in Your .env Files

**Root .env:**
```env
# SAFE - No secrets exposed
FRONTEND_PORT=80
BACKEND_PORT=3001
ML_PORT=8000
JWT_SECRET=blood-cancer-detection-secret-key-2024-change-this
BCRYPT_ROUNDS=12
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

### Generate Strong JWT Secret

Run this to generate a secure secret:

```powershell
# Generate random 64-character secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Copy the output and update your `.env`:

```env
JWT_SECRET=<paste-generated-secret-here>
```

---

## 🔒 STEP 2: UPDATE .gitignore (COMPREHENSIVE)

Update your `.gitignore` to exclude all sensitive files:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
*.env

# Dependencies
node_modules/
.venv/
__pycache__/
*.pyc

# Build outputs
dist/
build/
*.log

# Database
*.db
*.sqlite
*.sqlite3
prisma/dev.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Secrets
secrets/
*.pem
*.key
*.cert

# Model weights (large files)
*.pth
*.pt
*.h5
*.pkl

# Planning (your private notes)
.planning/

# Docker
.dockerignore

# Temporary files
tmp/
temp/
*.tmp
```

---

## 🔒 STEP 3: CREATE .env.example (SAFE TEMPLATE)

Create template files without actual secrets:

**Root .env.example:**
```env
# Port Configuration
FRONTEND_PORT=80
BACKEND_PORT=3001
ML_PORT=8000

# Backend Security (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=change-this-to-a-random-64-character-string
BCRYPT_ROUNDS=12

# CAPTCHA (Optional - Get from Google reCAPTCHA)
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

**Backend/.env.example:**
```env
# Database
DATABASE_URL=file:./prisma/dev.db

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=change-this-to-a-random-64-character-string
BCRYPT_ROUNDS=12

# ML Service
ML_SERVICE_URL=http://localhost:8000

# CAPTCHA (Optional)
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

---

## 🔒 STEP 4: ADD SECURITY HEADERS

Update Backend to add more security headers:

**Backend/src/app.js** - Add after helmet():

```javascript
// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  noSniff: true,
  xssFilter: true
}));

// Disable X-Powered-By header
app.disable('x-powered-by');
```

---

## 🔒 STEP 5: ADD REQUEST LOGGING (SECURITY AUDIT)

Install morgan for logging:

```powershell
cd Backend
npm install morgan
```

Add to **Backend/src/app.js:**

```javascript
import morgan from 'morgan';

// Security logging
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400 // Only log errors
}));
```

---

## 🔒 STEP 6: ADD BRUTE FORCE PROTECTION

Install express-slow-down:

```powershell
cd Backend
npm install express-slow-down
```

Add to **Backend/src/modules/auth/auth.routes.js:**

```javascript
import slowDown from 'express-slow-down';

// Slow down repeated login attempts
const loginSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 5, // Allow 5 requests per 15 minutes
  delayMs: 500, // Add 500ms delay per request after 5
  maxDelayMs: 20000, // Max 20 second delay
});

// Apply to login route
router.post('/login', loginSpeedLimiter, AuthController.login);
```

---

## 🔒 STEP 7: SECURE FILE UPLOADS

Your upload security is already good, but add file size limits:

**Backend/src/modules/upload/upload.routes.js:**

```javascript
// Add file size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1 // Only 1 file per request
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

---

## 🔒 STEP 8: ADD API KEY FOR ML SERVICE (OPTIONAL)

Secure communication between backend and ML service:

**ML Service - Add API key validation:**

**ml-service/app/main.py:**

```python
import os
from fastapi import Header, HTTPException

API_KEY = os.getenv("ML_API_KEY", "change-this-secret-key")

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key

# Add to predict endpoint
@app.post("/predict", dependencies=[Depends(verify_api_key)])
async def predict_endpoint(...):
    # existing code
```

**Backend - Send API key:**

**Backend/src/modules/predict/predict.service.js:**

```javascript
const response = await fetch(
  `${ML_SERVICE_URL}/predict?model=${encodeURIComponent(modelSelection)}`,
  {
    method: 'POST',
    body: formData,
    headers: {
      'X-API-Key': process.env.ML_API_KEY || 'change-this-secret-key'
    },
    signal: controller.signal,
  }
);
```

---

## 🔒 STEP 9: HTTPS ENFORCEMENT (PRODUCTION)

Add HTTPS redirect middleware:

**Backend/src/app.js:**

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 🔒 STEP 10: SECRETS MANAGEMENT FOR DEPLOYMENT

### For Railway/Render:

**Never commit these to GitHub:**
- JWT_SECRET
- Database passwords
- API keys
- CAPTCHA keys

**Instead:**
1. Set as environment variables in platform dashboard
2. Use platform's secret management
3. Rotate secrets regularly

### Generate Production Secrets:

```powershell
# JWT Secret (64 chars)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# ML API Key (32 chars)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Database encryption key (if needed)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## 🔒 STEP 11: CREATE SECURITY.md

Document your security practices:

```markdown
# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email: security@yourproject.com

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |

## Security Features

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Input validation
- File upload security
- Security headers (Helmet.js)
- HTTPS enforcement

## Best Practices

1. Never commit `.env` files
2. Rotate secrets every 90 days
3. Use strong passwords (12+ characters)
4. Enable 2FA on GitHub
5. Keep dependencies updated
6. Review audit logs regularly
```

---

## 🔒 STEP 12: VERIFY SECURITY

Run security checks:

```powershell
# Check for exposed secrets
cd "C:\Users\Akshat\IBM Project"
git log --all --full-history -- "*.env"

# Should return nothing - if it shows commits, secrets were exposed!
```

If secrets were exposed:

```powershell
# Remove from history (DANGEROUS - backup first!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if necessary)
git push origin --force --all
```

---

## ✅ SECURITY CHECKLIST

Before deploying:

- [ ] `.env` files are gitignored
- [ ] Strong JWT secret generated
- [ ] `.env.example` created (no real secrets)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Brute force protection added
- [ ] File upload limits set
- [ ] HTTPS enforcement enabled
- [ ] API keys rotated
- [ ] No secrets in git history
- [ ] SECURITY.md created
- [ ] Dependencies updated
- [ ] Audit logs enabled

---

## 🔐 DEPLOYMENT SECURITY

### Railway/Render Environment Variables:

**Set these in platform dashboard (NOT in code):**

```
JWT_SECRET=<generated-64-char-secret>
ML_API_KEY=<generated-32-char-secret>
DATABASE_ENCRYPTION_KEY=<generated-32-char-secret>
```

### Keep Repository Private:

**Option 1: Private Repo + Platform Access**
- Keep repo private on GitHub
- Grant Railway/Render access via OAuth
- Most secure option

**Option 2: Public Repo + Secret Management**
- Make repo public
- All secrets in platform environment variables
- No secrets in code
- Still secure if done correctly

---

## 🚨 WHAT NOT TO COMMIT

**NEVER commit these:**
- ❌ `.env` files
- ❌ Database files (*.db)
- ❌ API keys
- ❌ Passwords
- ❌ Private keys (*.pem, *.key)
- ❌ Model weights (*.pth)
- ❌ node_modules/
- ❌ __pycache__/

**Safe to commit:**
- ✅ `.env.example` (template only)
- ✅ Source code
- ✅ Dockerfiles
- ✅ Configuration files
- ✅ Documentation

---

## 🎯 QUICK SECURITY SETUP

Run these commands:

```powershell
cd "C:\Users\Akshat\IBM Project"

# 1. Generate strong JWT secret
$jwt = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET=$jwt"

# 2. Update .env file (manually copy the secret above)

# 3. Verify no secrets in git
git log --all --full-history -- "*.env"

# 4. Commit security updates
git add .gitignore
git commit -m "Enhanced security configuration"
git push origin main
```

---

## 🔒 FINAL RECOMMENDATION

**For Maximum Security:**

1. ✅ Keep repository **PRIVATE**
2. ✅ Grant Railway/Render access via OAuth
3. ✅ Set all secrets in platform dashboard
4. ✅ Enable 2FA on GitHub
5. ✅ Rotate secrets every 90 days
6. ✅ Monitor audit logs
7. ✅ Keep dependencies updated

**Your project is already quite secure! Just:**
- Generate stronger JWT secret
- Keep repo private
- Set secrets in deployment platform

---

**Ready to deploy securely?** 🔐

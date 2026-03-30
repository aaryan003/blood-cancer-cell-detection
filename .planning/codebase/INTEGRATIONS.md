# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**Authentication & Bot Detection:**
- Google reCAPTCHA - CAPTCHA verification for signup/login
  - SDK/Client: Native implementation in `/f/GUNI/SEM 8/Backend/src/captcha.js` (math-based CAPTCHA fallback)
  - Site Key env var: `RECAPTCHA_SITE_KEY`
  - Secret Key env var: `RECAPTCHA_SECRET_KEY`
  - Implementation: Simple math CAPTCHA (num1 + num2 or num1 - num2) with token-based validation
  - Token expiry: 5 minutes per CAPTCHA instance
  - Storage: In-memory Map (`captchaStore`) with background cleanup every 10 minutes

## Data Storage

**Primary Database:**
- **Type:** SQLite (development) / PostgreSQL (production)
- **Connection:** Via Prisma ORM
- **Connection String env var:** `DATABASE_URL`
- **Client:** Prisma Client (6.19.2)
- **Location:** `/f/GUNI/SEM 8/Backend/prisma/schema.prisma`

**Database Models:**
- `User` - User accounts with roles (ADMIN, DOCTOR, LAB_TECH, HOSPITAL)
- `Hospital` - Hospital organization records
- `Patient` - Patient information linked to hospitals
- `Report` - Blood cell analysis reports
- `Upload` - File uploads (images and PDFs)
- `Diagnosis` - AI diagnosis results with confidence scores
- `AuditLog` - User action logging for compliance

**File Storage:**
- Local filesystem only - Blood cell images and lab reports stored via multer
- Memory storage: `multer.memoryStorage()` in `/f/GUNI/SEM 8/Backend/src/uploadSecurity.js`
- Maximum file sizes:
  - Images (JPEG, PNG, TIFF): 10MB
  - PDFs: 10MB
  - Maximum 2 files per upload request

**Caching:**
- None detected (CAPTCHA tokens use in-memory Map as temporary cache)

## Authentication & Identity

**Auth Approach:**
- JWT-based authentication (custom implementation)
- Password hashing: bcryptjs (12 salt rounds)
- Local user registration and login
- JWT Secret env var: `JWT_SECRET`
- Auth flow: User signup/login → CAPTCHA validation → Password hash comparison → Token generation

**Session Management:**
- Frontend: localStorage-based (`authToken` key)
- Backend: JWT tokens (implementation in `/f/GUNI/SEM 8/Backend/src/modules/auth/auth.service.js`)
- Fallback: MockAuth in frontend (`localStorage` for testing without backend)

## Monitoring & Observability

**Error Tracking:**
- Not detected - Manual error logging to console

**Logging:**
- Prisma Query Logging: Configured in `/f/GUNI/SEM 8/Backend/src/config/prisma.js`
  - Logs: `['query', 'info', 'warn', 'error']`
- Console logging for errors and debug info
- Audit trail: `AuditLog` model for user action tracking

## CI/CD & Deployment

**Hosting:**
- Not configured - Development environment only
- Suggested platforms: Heroku, Railway, Vercel (frontend), Render (backend)

**CI Pipeline:**
- Not detected

**Environment-based Configuration:**
- Frontend: `VITE_API_URL` environment variable
- Backend: Multiple env vars (DATABASE_URL, PORT, JWT_SECRET, etc.)

## Environment Configuration

**Required Backend Environment Variables:**
- `DATABASE_URL` - Database connection string
  - Example: `postgresql://postgres:student@localhost:5432/blood_cancer_db`
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend origin for CORS (default: http://localhost:5173)
- `JWT_SECRET` - Secret for JWT signing
- `BCRYPT_ROUNDS` - Password hash rounds (default: 12)
- `NODE_ENV` - Environment mode (development/production)
- `RECAPTCHA_SITE_KEY` - Google reCAPTCHA public key
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA private key

**Required Frontend Environment Variables:**
- `VITE_API_URL` - Backend API base URL (default: http://localhost:3001)

**Secrets Management:**
- `.env` files (not committed to git)
- Environment variables in production deployment platform

## API Endpoints

**Backend API Routes:**

**Health & CAPTCHA:**
- `GET /health` - Health check endpoint
- `GET /api/captcha` - Generate CAPTCHA (returns token and question)

**Authentication:**
- `POST /api/auth/signup` - Register new user (requires CAPTCHA)
- `POST /api/auth/login` - User login (requires CAPTCHA)
- `POST /api/auth/logout` - User logout

**File Operations:**
- `POST /api/upload/sample` - Upload blood cell image and optional lab report (requires CAPTCHA)

**Additional Routes (defined but not fully implemented):**
- `POST /api/diagnosis` - Create diagnosis record
- `GET /api/reports` - Fetch patient reports
- `GET /api/metrics` - System metrics
- `GET /api/audit` - Audit logs

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Security Middleware

**Implemented:**
- Helmet.js - HTTP security headers (content-security-policy, x-frame-options, etc.)
- Express Rate Limiting - 100 requests per 15 minutes per IP
- CORS - Configured to frontend origin only
- CAPTCHA validation on signup/login/upload endpoints
- File upload security:
  - File extension validation (.jpg, .jpeg, .png, .tiff, .pdf only)
  - MIME type validation
  - Malicious signature detection (MZ, 7zXZ, Rar!, PK, shell scripts, PHP, JavaScript)
  - File size limits enforced per type

**Implementation Details:**
- Rate limiter: `/f/GUNI/SEM 8/Backend/src/app.js` (window: 15 min, max: 100 requests)
- File validation: `/f/GUNI/SEM 8/Backend/src/uploadSecurity.js`
- CAPTCHA validation: `/f/GUNI/SEM 8/Backend/src/captcha.js` (middleware: `validateCaptcha`)
- Upload security: `/f/GUNI/SEM 8/Backend/src/modules/upload/upload.routes.js` (pipeline: rate-limit → CAPTCHA → upload → error-handle → validate)

---

*Integration audit: 2026-03-30*

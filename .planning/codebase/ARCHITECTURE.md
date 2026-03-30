# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Layered MVC-like architecture with clear separation between frontend (React SPA) and backend (Express REST API).

**Key Characteristics:**
- Client-server architecture with REST API communication
- Frontend: React 18 with React Router for client-side routing
- Backend: Express.js with modular route/controller/service pattern
- Database: SQLite with Prisma ORM for type-safe database access
- Security-first design with CAPTCHA, rate limiting, and file validation

## Layers

**Frontend (React Client):**
- Purpose: User interface and client-side logic for blood cancer detection system
- Location: `Frontend/src/`
- Contains: React components, services, types, constants, styles
- Depends on: Backend API endpoints (via authService and fetch calls)
- Used by: End users via browser

**Backend (Express Server):**
- Purpose: REST API server handling authentication, file uploads, and data management
- Location: `Backend/src/`
- Contains: Route handlers, controllers, services, models, middleware
- Depends on: Prisma client, database, external libraries (bcrypt, multer, helmet)
- Used by: Frontend client, external services

**Database Layer (Prisma):**
- Purpose: Data persistence and query abstraction
- Location: `Backend/prisma/schema.prisma`
- Contains: User, Hospital, Patient, Report, Upload, Diagnosis, AuditLog models
- Depends on: SQLite database
- Used by: Backend services via Prisma client

**Security Middleware:**
- Purpose: Cross-cutting concerns for API protection
- Location: `Backend/src/app.js`, `Backend/src/uploadSecurity.js`, `Backend/src/captcha.js`
- Contains: Rate limiting, CORS, helmet, CAPTCHA generation/validation, file security
- Depends on: Express, multer, crypto
- Used by: All backend routes

## Data Flow

**Authentication Flow (Signup/Login):**

1. Frontend loads CAPTCHA question via `GET /api/captcha` → Backend generates question, stores answer in memory, returns token
2. User fills form and submits to `POST /api/auth/signup` or `POST /api/auth/login` with email, password, captchaToken, captchaAnswer
3. Backend `validateCaptcha` middleware validates CAPTCHA answer in memory store, proceeds to controller
4. `AuthController` performs field validation (name, email, password, role format)
5. `AuthService` checks existing user via `UserModel.findByEmail()`, hashes password with bcrypt, creates user in Prisma
6. Frontend receives user data and stores authToken in localStorage
7. Frontend redirects to `/dashboard`

**File Upload Flow:**

1. Frontend renders upload form at `/dashboard/upload` with CAPTCHA
2. User selects blood cell image and optional lab report
3. Form submission sends multipart/form-data to `POST /api/upload/sample` with CAPTCHA
4. Backend middleware chain executes in order:
   - `uploadRateLimit`: Checks IP-based rate limit (5 uploads/minute)
   - `validateCaptcha`: Validates CAPTCHA token and answer
   - `uploadFiles`: Multer processes multipart data into `req.files.bloodCellImage` and `req.files.labReport`
   - `handleUploadError`: Catches Multer-specific errors
   - `validateFileContent`: Checks file size, MIME type, malicious signatures, filename safety, generates secure filename
5. `UploadController.uploadSample` receives validated files, creates response with upload metadata
6. Frontend receives confirmation and redirects to `/results`

**State Management:**

- Frontend: Component-level useState for form state, localStorage for authToken persistence
- Backend: In-memory storage for CAPTCHA tokens (Map), in-memory rate limit tracking (Map on global.uploadAttempts)
- Database: Persistent user, hospital, patient, report, upload, diagnosis, audit log records

## Key Abstractions

**UserModel (Backend Data Access):**
- Purpose: Encapsulate database queries for user records
- Examples: `Backend/src/models/User.model.js`
- Pattern: Static methods wrapping Prisma client queries, error handling, selective field selection (password excluded from most responses)

**AuthService (Backend Business Logic):**
- Purpose: Handle signup and login logic with validation, hashing, and error mapping
- Examples: `Backend/src/modules/auth/auth.service.js`
- Pattern: Static methods for signup/login, bcrypt password hashing, duplicate email detection, password verification

**AuthController (Request Handler):**
- Purpose: Parse HTTP requests, validate input, call services, return API responses
- Examples: `Backend/src/modules/auth/auth.controller.js`
- Pattern: Static async methods receiving req/res, comprehensive validation before service call, detailed error codes (P2002 for unique constraint, etc.)

**CAPTCHA Module (Security):**
- Purpose: Generate math-based CAPTCHA questions and validate answers
- Examples: `Backend/src/captcha.js`
- Pattern: Express middleware using crypto.randomBytes for tokens, in-memory Map storage with 5-minute TTL, periodic cleanup every 10 minutes

**Upload Security Module (File Validation):**
- Purpose: Multi-layer file validation - extension, MIME type, size, malicious signatures, filename safety
- Examples: `Backend/src/uploadSecurity.js`
- Pattern: Multer configuration with custom storage/filters, separate middleware for content validation and error handling, secure filename generation using crypto

**Type Definitions (Frontend):**
- Purpose: TypeScript interfaces for API contracts and UI state
- Examples: `Frontend/src/types/index.ts` (User, AuthResponse, SignupData, LoginData, Captcha, DiagnosisResult, Patient, Report)
- Pattern: One-way flow - types represent API responses and form inputs

## Entry Points

**Frontend Entry:**
- Location: `Frontend/src/main.tsx` (implicitly via App.tsx)
- Triggers: Browser load via Vite dev server or built HTML
- Responsibilities: Renders React Router provider, mounts App component

**Backend Entry:**
- Location: `Backend/src/server.js`
- Triggers: `npm run dev` or `npm start`
- Responsibilities: Imports dotenv config, instantiates Express app, listens on PORT (default 3001), logs startup messages

**API Entry Points (Routes):**
- `Backend/src/app.js`: Defines middleware stack and top-level routes
- `GET /health`: Health check endpoint
- `GET /api/captcha`: CAPTCHA generation endpoint
- `POST /api/auth/signup`: User registration with CAPTCHA
- `POST /api/auth/login`: User authentication with CAPTCHA
- `POST /api/upload/sample`: File upload for diagnosis with rate limiting, CAPTCHA, file validation

**Frontend Route Entry Points:**
- Location: `Frontend/src/routes.tsx`
- Routes:
  - `/`: LandingPage (public)
  - `/signup`: SignupPage (public)
  - `/login`: LoginPage (public)
  - `/dashboard`: DashboardLayout (protected layout)
    - `/dashboard`: DashboardOverview
    - `/dashboard/upload`: UploadDiagnosis
    - `/dashboard/results`: DiagnosisResults
    - `/dashboard/metrics`: ModelMetrics
    - `/dashboard/reports`: PatientReports
    - `/dashboard/audit`: AuditLogs
    - `/dashboard/profile`: UserProfile

## Error Handling

**Strategy:** Consistent JSON response format with success flag, message, and optional data/errors array

**Patterns:**

**Backend Controller Level:**
- Try-catch wrapping all async handlers
- Explicit error checking after service calls (e.g., "User with this email already exists")
- Database-specific error handling: Prisma error codes (P2002 for unique constraint, P1001 for connection)
- HTTP status codes: 400 (validation), 401 (auth), 409 (conflict), 503 (database), 500 (unhandled)
- Example: `Backend/src/modules/auth/auth.controller.js` lines 75-105 (signup) and 148-170 (login)

**Frontend Service Level:**
- Try-catch with fallback to mock responses when backend unavailable
- localStorage as mock database when API fails
- Error from response.json() passed to caller as `error` field
- Example: `Frontend/src/services/authService.ts` lines 55-87 (signup fallback)

**Middleware Error Handlers:**
- Express-validator checks request format
- Multer error handler in `uploadSecurity.js` catches LIMIT_FILE_SIZE, LIMIT_FILE_COUNT, etc.
- Global error handler in `Backend/src/app.js` catches unhandled middleware errors

**CAPTCHA Validation Errors:**
- 400: Missing token/answer, invalid/expired token, incorrect answer
- Example: `Backend/src/captcha.js` lines 53-102

## Cross-Cutting Concerns

**Logging:**
- Backend: console.error/warn in try-catch blocks, Prisma logs (query, info, warn, error) configured in `Backend/src/config/prisma.js`
- Frontend: console.error/warn in services and components

**Validation:**
- Frontend: Regex patterns for email, password requirements (uppercase, lowercase, digit), name format in `LoginPage.tsx` and auth service
- Backend: Same regex patterns replicated in `AuthController` (email, password, name, role), file extension/MIME type in `uploadSecurity.js`
- CAPTCHA validation: Token lookup, expiry check, numeric answer parsing in `captcha.js`

**Authentication:**
- CAPTCHA: All signup/login protected with math question validation
- Token Storage: Frontend stores in localStorage, backend relies on CAPTCHA per request (stateless for auth, session-like for CAPTCHA)
- No JWT/bearer token currently - authToken stored in localStorage for potential future use
- Role-based data available but not enforced in routes yet (ADMIN, DOCTOR, LAB_TECH, HOSPITAL defined in schema)

**Rate Limiting:**
- Express global limiter: 100 requests per 15 minutes per IP (via express-rate-limit)
- Upload endpoint: 5 uploads per minute per IP via custom middleware in `uploadSecurity.js`
- CAPTCHA: 5-minute token expiry with periodic cleanup

**CORS:**
- Configured to allow FRONTEND_URL (env var, defaults to http://localhost:5173)
- credentials: true enabled for cookie-based auth (if future implemented)

**Security Headers:**
- Helmet middleware applied globally for security headers (X-Content-Type-Options, X-Frame-Options, etc.)

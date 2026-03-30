# Codebase Structure

**Analysis Date:** 2026-03-30

## Directory Layout

```
F:\GUNI\SEM 8/
├── Backend/                          # Express.js REST API server
│   ├── src/
│   │   ├── app.js                   # Express app setup with middleware and routes
│   │   ├── server.js                # Entry point, listens on port 3001
│   │   ├── captcha.js               # CAPTCHA generation and validation middleware
│   │   ├── uploadSecurity.js        # File upload validation, multer config, rate limiting
│   │   ├── config/
│   │   │   └── prisma.js            # Prisma client initialization and graceful shutdown
│   │   ├── models/
│   │   │   └── User.model.js        # User data access layer wrapping Prisma queries
│   │   └── modules/
│   │       ├── auth/
│   │       │   ├── auth.routes.js   # GET/POST /api/auth routes with CAPTCHA middleware
│   │       │   ├── auth.controller.js # Signup/login request handlers with validation
│   │       │   └── auth.service.js   # Signup/login business logic, password hashing
│   │       └── upload/
│   │           ├── upload.routes.js  # POST /api/upload/sample with security middleware
│   │           └── upload.controller.js # File upload handler, sample processing
│   ├── prisma/
│   │   ├── schema.prisma            # Data models: User, Hospital, Patient, Report, Upload, Diagnosis, AuditLog
│   │   └── migrations/              # Generated database migrations (auto-created by Prisma)
│   ├── generated/
│   │   └── prisma/                  # Auto-generated Prisma client code (do not edit)
│   ├── node_modules/                # Dependencies (not committed)
│   ├── package.json                 # Backend dependencies and scripts
│   └── .env                         # Environment variables (DATABASE_URL, FRONTEND_URL, PORT, BCRYPT_ROUNDS)
│
├── Frontend/                         # React + TypeScript SPA
│   ├── src/
│   │   ├── App.tsx                  # Root component, renders RouterProvider
│   │   ├── main.tsx                 # Vite entry point, ReactDOM.createRoot
│   │   ├── routes.tsx               # React Router configuration with all routes
│   │   ├── components/
│   │   │   ├── LandingPage.tsx      # Homepage with features overview
│   │   │   ├── SignupPage.tsx       # User registration form with CAPTCHA
│   │   │   ├── LoginPage.tsx        # User login form with CAPTCHA
│   │   │   ├── DashboardLayout.tsx  # Sidebar navigation and layout wrapper
│   │   │   ├── DashboardOverview.tsx # Main dashboard stats and overview
│   │   │   ├── UploadDiagnosis.tsx  # Blood cell image upload form with CAPTCHA
│   │   │   ├── DiagnosisResults.tsx # Display analysis results
│   │   │   ├── ModelMetrics.tsx     # Model performance statistics
│   │   │   ├── PatientReports.tsx   # Patient report listing
│   │   │   ├── AuditLogs.tsx        # Security and audit logs
│   │   │   ├── UserProfile.tsx      # User profile management
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx # Image component with fallback handling
│   │   │   └── ui/                  # Radix UI + Tailwind component library
│   │   │       ├── button.tsx, input.tsx, dialog.tsx, etc. (50+ base components)
│   │   ├── services/
│   │   │   └── authService.ts       # Singleton service: fetch CAPTCHA, signup, login, logout, isAuthenticated
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces: User, AuthResponse, SignupData, LoginData, Captcha, DiagnosisResult, Patient, Report
│   │   ├── constants/
│   │   │   └── index.ts             # APP_CONFIG, ROLES, ROLE_LABELS, API_ENDPOINTS
│   │   ├── lib/
│   │   │   └── utils.ts             # Utility function cn() for class name merging (clsx + tailwind-merge)
│   │   ├── styles/
│   │   │   ├── globals.css          # Global Tailwind styles
│   │   │   └── index.css            # Base styles
│   │   └── utils/                   # Additional utilities (if any)
│   ├── public/                      # Static assets (favicon, etc.)
│   ├── node_modules/                # Dependencies (not committed)
│   ├── package.json                 # Frontend dependencies and scripts
│   ├── tsconfig.json                # TypeScript config with path aliases
│   ├── vite.config.ts               # Vite bundler configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration for Tailwind
│   └── .env.example                 # Example env variables (VITE_API_URL)
│
├── .planning/                       # GSD planning output
│   └── codebase/                    # Codebase analysis documents (this file location)
├── .git/                            # Git repository
├── CAPTCHA_FIX_SUMMARY.md          # Documentation on CAPTCHA implementation
├── CAPTCHA_FLOW_DIAGRAM.md         # Flow diagrams for CAPTCHA
├── CAPTCHA_INTEGRATION_SUMMARY.md  # CAPTCHA integration details
└── image.png                        # Reference screenshot
```

## Directory Purposes

**Backend/src:**
- Purpose: All backend application code
- Contains: Route handlers, middleware, services, models, configuration
- Key files: `app.js` (middleware), `server.js` (entry), `captcha.js` (CAPTCHA), `uploadSecurity.js` (file validation)

**Backend/src/config:**
- Purpose: Configuration and initialization modules
- Contains: Prisma client setup with logging and shutdown handlers
- Key files: `prisma.js`

**Backend/src/models:**
- Purpose: Data access layer abstracting Prisma queries
- Contains: Static methods for database operations on specific entities
- Key files: `User.model.js` (create, findByEmail, findById, count)

**Backend/src/modules:**
- Purpose: Feature modules organized by domain
- Contains: Separate auth and upload modules, each with routes, controllers, and services
- Key files: `auth/`, `upload/` subdirectories

**Backend/prisma:**
- Purpose: Schema definition and migrations
- Contains: `schema.prisma` with all data model definitions
- Key files: `schema.prisma`, `migrations/` auto-generated by Prisma

**Frontend/src/components:**
- Purpose: React components organized by feature/page
- Contains: Page components (LandingPage, LoginPage, DashboardLayout), feature components (UploadDiagnosis, DiagnosisResults), UI library (ui/)
- Key files: Major pages, utility components, Radix UI + Tailwind base components

**Frontend/src/services:**
- Purpose: API client layer and business logic
- Contains: Singleton services wrapping fetch calls with fallback to mock responses
- Key files: `authService.ts` (all auth operations)

**Frontend/src/types:**
- Purpose: TypeScript interface definitions
- Contains: Data models matching API responses and form shapes
- Key files: `index.ts` with all exported interfaces

**Frontend/src/constants:**
- Purpose: Configuration and constants
- Contains: API endpoints, app config, role definitions
- Key files: `index.ts` with APP_CONFIG, ROLES, API_ENDPOINTS

## Key File Locations

**Entry Points:**
- Backend: `Backend/src/server.js` - Listens on port 3001, imports app from `app.js`
- Frontend: `Frontend/src/main.tsx` - Creates React root and mounts App component
- Frontend App: `Frontend/src/App.tsx` - Renders RouterProvider with routes from `routes.tsx`

**Configuration:**
- Backend: `Backend/src/app.js` - Middleware stack, route registration, error handlers
- Backend: `Backend/src/config/prisma.js` - Prisma client with logging
- Backend: `Backend/prisma/schema.prisma` - Database models
- Frontend: `Frontend/tsconfig.json` - TypeScript with path alias `@/*` → `src/*`
- Frontend: `Frontend/vite.config.ts` - Vite bundler setup with React plugin
- Frontend: `Frontend/tailwind.config.js` - Tailwind CSS customization

**Core Logic:**
- Backend Auth: `Backend/src/modules/auth/auth.service.js` - Signup/login with bcrypt hashing
- Backend Upload: `Backend/src/modules/upload/upload.controller.js` - File upload handler
- Backend Security: `Backend/src/captcha.js` - CAPTCHA generation/validation
- Backend File Validation: `Backend/src/uploadSecurity.js` - Multer config, file checks, rate limiting
- Frontend Auth: `Frontend/src/services/authService.ts` - Fetch CAPTCHA, signup, login, fallback to localStorage

**Testing:**
- No test files found - testing infrastructure not yet implemented

## Naming Conventions

**Files:**

- Page Components: PascalCase `.tsx` (e.g., `LoginPage.tsx`, `DashboardLayout.tsx`)
- UI Components: PascalCase `.tsx` (e.g., `Button.tsx`, `Card.tsx`)
- Services: camelCase with Service suffix `.ts` (e.g., `authService.ts`)
- Models: PascalCase with `.model.js` suffix (e.g., `User.model.js`)
- Controllers: camelCase with `.controller.js` suffix (e.g., `auth.controller.js`)
- Routes: camelCase with `.routes.js` suffix (e.g., `auth.routes.js`)
- Config: camelCase `.js` or `.ts` (e.g., `prisma.js`, `tailwind.config.js`)
- Utilities: camelCase `.ts` or `.js` (e.g., `utils.ts`)

**Directories:**

- Feature Modules (Backend): lowercase plural (e.g., `modules/auth/`, `modules/upload/`)
- Component Groups: lowercase plural (e.g., `components/ui/`, `src/types/`, `src/constants/`)
- Config Directories: lowercase (e.g., `config/`, `prisma/`)

**Functions/Variables:**

- Service Methods: camelCase (e.g., `fetchCaptcha`, `login`, `signup`)
- Component Props: camelCase (standard React convention)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_IMAGE_SIZE`, `ALLOWED_IMAGE_TYPES`, `ROLES`)
- React Hooks: camelCase starting with `use` (e.g., `useState`, `useEffect`, `useNavigate`)

**Database:**

- Models: PascalCase (e.g., `User`, `Hospital`, `Patient`)
- Enums: PascalCase (e.g., `Role`, `Gender`)
- Fields: camelCase (e.g., `createdAt`, `patientId`, `hospitalId`)

## Where to Add New Code

**New Feature (Page):**
- Component: `Frontend/src/components/FeatureName.tsx`
- Route: Add to `Frontend/src/routes.tsx` in the router config
- Service (if API needed): `Frontend/src/services/featureService.ts`
- Backend Route: `Backend/src/modules/feature/feature.routes.js`
- Backend Controller: `Backend/src/modules/feature/feature.controller.js`
- Backend Service: `Backend/src/modules/feature/feature.service.js`
- Database Model: Add to `Backend/prisma/schema.prisma`, run `npm run db:migrate`

**New UI Component:**
- Location: `Frontend/src/components/ui/ComponentName.tsx`
- Pattern: Follow Radix UI + Tailwind styling from existing components in `ui/` directory

**New Service/Utility:**
- Frontend helper: `Frontend/src/lib/helperName.ts` or `Frontend/src/utils/helperName.ts`
- Backend helper: `Backend/src/utils/helperName.js` (create if doesn't exist)

**New Middleware:**
- Backend: `Backend/src/middleware/middlewareName.js` (create if doesn't exist)
- Add to middleware stack in `Backend/src/app.js`

**New Database Entity:**
- Add model to `Backend/prisma/schema.prisma`
- Create corresponding model file: `Backend/src/models/EntityName.model.js`
- Create migration: `npm run db:migrate`

## Special Directories

**Backend/generated/prisma/**
- Purpose: Auto-generated Prisma client code
- Generated: Yes (automatically by `prisma generate`)
- Committed: No (.gitignore)
- Note: Do not edit manually - regenerate with `npm run db:generate`

**Backend/prisma/migrations/**
- Purpose: Database migration history
- Generated: Yes (automatically by Prisma during `npm run db:migrate`)
- Committed: Yes (tracks schema evolution)

**Frontend/node_modules/**
- Purpose: Package dependencies
- Generated: Yes (by npm install)
- Committed: No (.gitignore)

**Frontend/dist/**
- Purpose: Built production bundle
- Generated: Yes (by `npm run build`)
- Committed: No (.gitignore)

**Backend/node_modules/**
- Purpose: Package dependencies
- Generated: Yes (by npm install)
- Committed: No (.gitignore)

## Import Path Aliases

**Frontend:**
- `@/*` → `src/*` (configured in `Frontend/tsconfig.json`)
- Used as: `import { Button } from '@/components/ui/button'`
- Benefit: Cleaner imports, easier refactoring

## Environment Variables

**Backend (.env file):**
- `DATABASE_URL` - SQLite database connection string
- `FRONTEND_URL` - CORS origin (default: http://localhost:5173)
- `PORT` - Server port (default: 3001)
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)

**Frontend (.env file via Vite):**
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)
- Vite prefix: Must start with `VITE_` to be accessible via `import.meta.env`

## Module Organization Pattern

**Backend Modules:**
Each module (e.g., `modules/auth/`, `modules/upload/`) follows this pattern:
```
modules/
└── moduleName/
    ├── moduleName.routes.js     # Express Router with all endpoints
    ├── moduleName.controller.js # Request handlers, validation
    └── moduleName.service.js    # Business logic, database operations
```

**Responsibility Distribution:**
- Routes: Path definition, middleware application order, error delegation
- Controller: HTTP parsing, validation, exception handling, response formatting
- Service: Core business logic, database/external service calls, error propagation

# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- JavaScript (ES6+) - Backend server, utilities, models
- TypeScript (5.7.3) - Frontend application, components, services, routes

**Runtime:**
- Node.js (v23.4.0) - Backend server runtime

## Runtime & Package Management

**Environment:**
- Node.js v23.4.0
- npm 11.10.0

**Package Manager:**
- npm - Lockfiles present (`package-lock.json` in both Backend and Frontend)

## Frameworks

**Backend:**
- Express.js (4.18.2) - Web server framework, routing, middleware
- Prisma (6.19.2) - ORM for database access and migrations

**Frontend:**
- React (18.3.1) - UI library and component framework
- React Router (7.1.1) - Client-side routing and navigation
- Vite (6.0.5) - Build tool and dev server

**UI & Components:**
- Radix UI (multiple packages @radix-ui/* v1.x) - Accessible UI components
- Tailwind CSS (3.4.0) - Utility-first CSS framework
- Recharts (2.15.0) - Charting and data visualization
- Lucide React (0.468.0) - Icon library
- Sonner (2.0.3) - Toast notifications

**Styling & Utilities:**
- PostCSS (8.4.49) - CSS transformation tool
- Autoprefixer (10.4.20) - CSS vendor prefixes
- Class Variance Authority (0.7.1) - Component variant management
- clsx (2.1.1) - Conditional CSS class composition
- Tailwind Merge (2.6.0) - Merge Tailwind CSS classes intelligently

**Date & Form:**
- date-fns (4.1.0) - Date utility library
- react-day-picker (9.4.4) - Calendar component
- input-otp (1.4.1) - OTP input component
- cmdk (1.0.4) - Command menu component
- vaul (1.1.2) - Drawer component library

**Responsive & Layout:**
- react-resizable-panels (2.1.7) - Resizable panel layouts
- embla-carousel-react (8.5.2) - Carousel/slider component

## Key Dependencies

**Security & Validation:**
- bcryptjs (2.4.3) - Password hashing and comparison
- express-validator (7.0.1) - Request validation and sanitization
- helmet (7.1.0) - HTTP security headers middleware
- express-rate-limit (7.1.5) - Rate limiting middleware
- multer (2.0.2) - File upload handling middleware
- file-type (21.3.0) - Detect file types from buffer

**Environment & Configuration:**
- dotenv (17.2.3) - Environment variable loading from .env files

**CORS:**
- cors (2.8.5) - Cross-Origin Resource Sharing middleware

## Database

**Primary Database:**
- SQLite (configured in Prisma schema) - Local development database
- PostgreSQL - Production database (connection string in .env)

**ORM & Client:**
- Prisma Client (6.19.2) - Type-safe database client
- Prisma CLI (6.19.2) - Migration and schema management

## Build & Development Tools

**Frontend Build:**
- Vite (6.0.5) - Fast build tool and dev server
- @vitejs/plugin-react (4.3.4) - React JSX transformation plugin
- TypeScript (5.7.3) - Type checking and compilation

**Linting & Formatting:**
- ESLint (9.18.0) - Code quality and style linting
- @typescript-eslint/eslint-plugin (8.18.2) - TypeScript ESLint rules
- @typescript-eslint/parser (8.18.2) - TypeScript parser for ESLint
- eslint-plugin-react-hooks (5.1.0) - React hooks linting
- eslint-plugin-react-refresh (0.4.16) - Fast Refresh linting

**Type Definitions:**
- @types/node (22.10.5) - Node.js type definitions
- @types/react (18.3.18) - React type definitions
- @types/react-dom (18.3.5) - React DOM type definitions

## Configuration Files

**Frontend:**
- `tsconfig.json` - TypeScript compilation settings with path aliases (`@/*`)
- `vite.config.ts` - Vite build configuration with React plugin and path aliases
- `postcss.config.js` - PostCSS configuration for Tailwind CSS

**Backend:**
- `prisma/schema.prisma` - Prisma schema defining User, Hospital, Patient, Report, Upload, Diagnosis, AuditLog models
- `.env` - Environment variables (development)

## Environment Configuration

**Required Environment Variables:**

Backend (`/f/GUNI/SEM 8/Backend/.env`):
- `DATABASE_URL` - SQLite or PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `JWT_SECRET` - Secret key for JWT token generation
- `BCRYPT_ROUNDS` - Rounds for bcrypt hashing (default: 12)
- `NODE_ENV` - Environment (development/production)
- `RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA secret key

Frontend (`src/constants/index.ts`):
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

## Platform Requirements

**Development:**
- Node.js v23.4.0 or compatible
- npm 11.10.0 or compatible
- SQLite (included with system) or PostgreSQL instance

**Production:**
- Node.js v20+ (LTS recommended)
- PostgreSQL database server
- Environment variables configured (see above)

## Scripts

**Backend (`/f/GUNI/SEM 8/Backend/package.json`):**
- `npm run dev` - Start development server with hot reload (`node --watch src/server.js`)
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run migrations in development

**Frontend (`/f/GUNI/SEM 8/Frontend/package.json`):**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build production bundle (TypeScript + Vite)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint and report unused disable directives

---

*Stack analysis: 2026-03-30*

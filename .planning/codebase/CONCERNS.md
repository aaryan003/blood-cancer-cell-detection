# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**Mock Authentication Fallback (Production Risk):**
- Issue: `Frontend/src/services/authService.ts` stores user credentials in localStorage when backend is unavailable, enabling insecure mock authentication
- Files: `Frontend/src/services/authService.ts` (lines 56-87, 119-151)
- Impact: Passwords stored in plaintext in browser localStorage. If backend unavailable, system falls back to localStorage for auth validation without server verification. Creates false sense of security.
- Fix approach: Remove mock fallback before production. Implement proper offline handling that clearly indicates backend unavailability rather than silently switching to insecure mode. Consider service worker caching for UI-only offline mode.

**In-Memory CAPTCHA Storage (Scalability Risk):**
- Issue: CAPTCHA data stored in JavaScript `Map()` in-process memory with manual cleanup intervals
- Files: `Backend/src/captcha.js` (lines 3, 105-115)
- Impact: Cannot scale horizontally (each server instance has separate store). No persistence if process crashes. Memory leak risk if cleanup fails. Limited by single-process memory.
- Fix approach: Migrate to Redis or database before scaling. Replace `setInterval(cleanExpiredCaptchas, 10 * 60 * 1000)` with proper TTL-based expiry.

**Exposed Secrets in .env File:**
- Issue: `.env` file committed to repository with valid secret keys visible in git history
- Files: `Backend/.env` (lines 18, 25-26)
- Impact: `JWT_SECRET`, `RECAPTCHA_SITE_KEY`, and `RECAPTCHA_SECRET_KEY` are in plaintext in repo. Anyone with repo access can use these keys. Keys may already be compromised.
- Fix approach: Remove `.env` from git history with `git filter-branch` or BFG. Rotate all exposed keys immediately. Use `.env.example` with placeholder values. Implement pre-commit hook to prevent `.env` commits.

**Vulnerable File Upload Handler (Security Risk):**
- Issue: Malicious file signature detection uses simple string matching on buffer that can be bypassed
- Files: `Backend/src/uploadSecurity.js` (lines 93-96)
- Impact: Attackers can disguise malware as images by appending image header bytes. MIME type validation alone insufficient - relies on Content-Type header sent by client.
- Fix approach: Use `file-type` library (already in dependencies) to verify actual file content. Don't rely on MIME type or extension alone. Implement sandboxed file analysis.

**No Error Details Logging (Debugging Difficulty):**
- Issue: Error handlers log errors but don't capture request context, stack traces, or error codes consistently
- Files: `Backend/src/modules/auth/auth.controller.js`, `Backend/src/app.js`, `Backend/src/captcha.js`
- Impact: Difficult to debug production issues. No structured logging. No error tracking/monitoring integration. Console.error may not be captured in production.
- Fix approach: Implement structured logging (Winston or Pino). Include request ID, user info, timestamp, stack traces. Send critical errors to error tracking service (Sentry, etc.).

**Hardcoded Rate Limiting (Not Configurable):**
- Issue: Rate limits hardcoded in multiple places without environment variable configuration
- Files: `Backend/src/app.js` (lines 15-20), `Backend/src/uploadSecurity.js` (lines 135-136)
- Impact: Cannot adjust limits without code change. Different limits for different endpoints (100 global, 5 uploads/min) may not match business needs.
- Fix approach: Move all rate limits to `.env` configuration. Use consistent approach across endpoints.

## Security Considerations

**CAPTCHA Brute Force Vulnerability (Medium Risk):**
- Risk: Math CAPTCHA with only 81 possible answers (1-10 + 1-10 range for subtraction). Attacker can try all answers rapidly.
- Files: `Backend/src/captcha.js` (lines 6-50)
- Current mitigation: 5-minute expiry, one-time use token. Rate limiting on auth endpoints helps.
- Recommendations: Increase number range (1-100 or higher), implement progressive difficulty after failed attempts, require longer pauses between attempts, integrate with reCAPTCHA v2/v3 for production.

**SQL Injection via Email Normalization (Low Risk - Prisma Safe):**
- Risk: Email stored after .toLowerCase() and trim without SQL injection risk due to Prisma, but email normalization happens at multiple places
- Files: `Backend/src/modules/auth/auth.controller.js` (multiple email normalizations), `Frontend/src/components/LoginPage.tsx` (lines 50, 77), `Frontend/src/components/SignupPage.tsx` (line 127)
- Current mitigation: Prisma parameterized queries prevent SQL injection. Email regex validation.
- Recommendations: Create single email normalization function to avoid duplication. Standardize across frontend/backend.

**localStorage Sensitive Data Exposure (High Risk in Mock Mode):**
- Risk: Plaintext password and tokens stored in localStorage when mock auth is active, accessible via XSS
- Files: `Frontend/src/services/authService.ts` (lines 62, 80-81, 125-128, 138, 155)
- Current mitigation: None. Mock mode is fallback when backend unavailable.
- Recommendations: Never store passwords. Use httpOnly cookies for tokens (if backend available). Disable mock mode in production entirely.

**No HTTPS Enforcement (Not in Code - Infrastructure Level):**
- Risk: CAPTCHA tokens, passwords, auth data transmitted unencrypted if HTTP used
- Files: All auth endpoints
- Current mitigation: None visible in code
- Recommendations: Set `HTTPS_ONLY` in production, add HSTS headers via helmet (already installed), enforce redirect from HTTP to HTTPS.

**Missing CORS Preflight Protection (Medium Risk):**
- Risk: CORS configured but doesn't validate against whitelist for preflight requests
- Files: `Backend/src/app.js` (lines 22-26)
- Current mitigation: CORS origin checked against `FRONTEND_URL` env var
- Recommendations: Implement stricter CORS validation, consider CSRF tokens for state-changing operations.

## Performance Bottlenecks

**Synchronous File Operations (Upload Slowdown):**
- Problem: File validation happens synchronously in middleware, blocks entire request
- Files: `Backend/src/uploadSecurity.js` (lines 63-128, async but blocking in middleware chain)
- Cause: `validateFileContent` checks all files sequentially, malicious signature scanning is CPU-bound
- Improvement path: Use worker threads for malicious signature detection, implement streaming validation for large files

**In-Memory Map Without Cleanup Edge Case (Memory Pressure):**
- Problem: If `cleanExpiredCaptchas` misses an interval or takes too long, expired entries accumulate
- Files: `Backend/src/captcha.js` (line 115 - 10-minute interval may be too long)
- Cause: JavaScript `setInterval` can be delayed by event loop, entries only cleaned on next generation
- Improvement path: Use `setImmediate` or background task queue, implement max-size limit with LRU eviction

**No Database Connection Pooling Visible (Scalability Risk):**
- Problem: Prisma client instantiation not shown, unclear if connection pooling configured
- Files: `Backend/src/config/prisma.js`
- Cause: SQLite not designed for concurrent access, no pool config if PostgreSQL used
- Improvement path: Check Prisma pool configuration, use connection pooling for production database

**Regex Validation in Hot Path (CPU Cycles):**
- Problem: Email/name/password validation regexes executed on every request
- Files: `Backend/src/modules/auth/auth.controller.js` (lines 18, 26, 41), `Frontend/src/components/` (multiple)
- Cause: Complex regexes evaluated per request instead of compiled
- Improvement path: Pre-compile regexes as constants, consider using validation library (Zod, etc.)

## Fragile Areas

**CAPTCHA Implementation (Coupling & Refactoring Risk):**
- Files: `Backend/src/captcha.js`, `Backend/src/modules/auth/auth.routes.js`, `Frontend/src/services/authService.ts`, `Frontend/src/components/LoginPage.tsx`, `Frontend/src/components/SignupPage.tsx`, `Frontend/src/components/UploadDiagnosis.tsx`
- Why fragile: CAPTCHA tightly coupled to auth/upload routes. Frontend and backend CAPTCHA logic duplicated. Changing generation algorithm requires changes in 3+ files. Token format hardcoded everywhere.
- Safe modification: Create CAPTCHA abstraction layer. Extract token format to constant. Use shared types. Implement factory pattern for generation logic.
- Test coverage: No test files found for CAPTCHA generation/validation. Critical auth component untested.

**Email Normalization Scattered (Consistency Risk):**
- Files: Multiple (auth.service.js, auth.controller.js, LoginPage.tsx, SignupPage.tsx, authService.ts)
- Why fragile: Different normalization in different places. Some files do `toLowerCase()` + `trim()`, others use regex. Frontend/backend inconsistency possible.
- Safe modification: Create shared utility function `normalizeEmail()`. Use everywhere. Unit test normalization.
- Test coverage: No visible tests for email normalization edge cases.

**File Upload Without Database Persistence (Data Loss Risk):**
- Files: `Backend/src/modules/upload/upload.controller.js`
- Why fragile: Upload returns mock response without saving to database. Files accepted but not stored. Diagram shows upload flow but implementation is incomplete.
- Safe modification: Don't remove mock yet (documented as placeholder). Add TODO comment. Implement actual file storage with database tracking before production.
- Test coverage: Upload handler not tested. No integration tests visible.

**Type Safety Gaps in Frontend (Refactoring Risk):**
- Files: `Frontend/src/services/authService.ts` (lines 62, 125, 126)
- Why fragile: `any` type used in mock auth for user objects. Array.find uses `any` type. Risks runtime errors on property access.
- Safe modification: Create User type. Use it instead of `any`. Run TypeScript strict mode checks.
- Test coverage: No tests for authService. Mock fallback untested.

## Scaling Limits

**Single-Process CAPTCHA Storage (Horizontal Scaling):**
- Current capacity: ~100-1000 concurrent CAPTCHA tokens per instance (depends on memory)
- Limit: Cannot share CAPTCHA state across multiple server instances. Load balanced requests go to different instances with different stores.
- Scaling path: Migrate to Redis (key: token, value: {answer, expires}). TTL-based expiry. Shared across all instances.

**SQLite Database (Production Scaling):**
- Current capacity: Single database file, write lock on each request
- Limit: SQLite not suitable for multiple concurrent writers. Cannot scale horizontally without synchronization overhead.
- Scaling path: Migrate to PostgreSQL/MySQL for production. Keep SQLite for development/testing.

**In-Memory Upload Rate Limiting (Per-Instance Only):**
- Current capacity: Tracks upload attempts per instance only
- Limit: Multiple server instances cannot share rate limit state. Attacker can distribute requests across instances to bypass limit.
- Scaling path: Move rate limit tracking to Redis or database. Implement distributed rate limiting.

**File Storage in Memory (Upload Throughput):**
- Current capacity: Limited by available RAM. multer memoryStorage() stores entire file in RAM.
- Limit: Large concurrent uploads will exhaust memory
- Scaling path: Use disk storage or cloud storage (S3, etc.). Stream files instead of buffering.

## Dependencies at Risk

**Unmaintained or Outdated Packages:**
- Risk: No visible lock file update strategy. package-lock.json may contain vulnerable transitive dependencies.
- Impact: Known security vulnerabilities in dependencies could be exploited
- Migration plan: Audit dependencies with `npm audit`. Update regularly. Use Dependabot or Renovate for automated updates.

**file-type Library (Installed but Maybe Unused):**
- Risk: `file-type` ^21.3.0 installed but not used in uploadSecurity.js. Custom malicious signature detection instead.
- Impact: Duplicate functionality. Binary signatures hardcoded instead of using maintained library.
- Migration plan: Replace custom signature detection with file-type library. Remove custom implementation.

**Prisma ORM Coupling:**
- Risk: Database layer tightly coupled to Prisma. Schema changes require migration + code changes
- Impact: Difficult to test without database. No ORM abstraction layer.
- Migration plan: Create repository pattern abstraction over Prisma. Allow testing with in-memory db. Not urgent.

## Missing Critical Features

**No Authentication Middleware (Security Gap):**
- Problem: Dashboard endpoints (`/dashboard`, `/upload`, `/diagnosis`) not protected. No JWT verification visible.
- Blocks: Any authenticated user endpoints. Only auth routes have CAPTCHA protection.
- Gap files: `Frontend/src/routes.tsx`, `Backend/src/modules/` (missing protected route handlers)

**No Error Recovery for CAPTCHA Failures (UX Gap):**
- Problem: If CAPTCHA endpoint returns 500, frontend shows spinner indefinitely
- Blocks: User cannot submit form if CAPTCHA fails to load
- Gap location: `Frontend/src/services/authService.ts` - no retry logic, no error state

**No Audit Logging (Compliance Gap):**
- Problem: No logging of auth attempts, file uploads, or admin actions
- Blocks: Cannot track who did what when. Required for HIPAA/compliance.
- Gap location: Database has `AuditLog` table but not used anywhere in code

**No Refresh Token/Session Management (Auth Gap):**
- Problem: No token refresh mechanism visible. Auth tokens never expire (no JWT validation on backend).
- Blocks: Long-lived sessions. No way to revoke access. Tokens stored indefinitely.
- Gap location: Backend returns no token, frontend doesn't validate expiry

**No User Role Enforcement (Authorization Gap):**
- Problem: Database schema has roles but no endpoint authorization checks
- Blocks: All authenticated users can access all endpoints regardless of role
- Gap location: Controller methods don't check user role

## Test Coverage Gaps

**No Backend Tests (High Risk):**
- What's not tested: CAPTCHA generation/validation, auth service, upload validation, file security checks, error handling
- Files: `Backend/src/**/*.js` - no test files found
- Risk: Critical auth and file handling untested. Refactoring introduces bugs. Regressions not caught.
- Priority: HIGH - auth and file upload are security critical

**No Frontend Service Tests (Medium Risk):**
- What's not tested: authService.ts login/signup/captcha logic, mock auth fallback, error handling
- Files: `Frontend/src/services/**/*.ts` - no test files found
- Risk: Mock auth fallback behavior untested. Impossible to verify localStorage security issues are contained.
- Priority: HIGH for security-critical code

**No Component Tests (Medium Risk):**
- What's not tested: LoginPage, SignupPage form validation, error states, CAPTCHA rendering, loading states
- Files: `Frontend/src/components/` - no test files found
- Risk: UI validation logic untested. CAPTCHA loading states may fail silently. Form validation edge cases.
- Priority: MEDIUM - functional correctness important but not security-critical

**No Integration Tests (Medium Risk):**
- What's not tested: Full auth flow (signup -> login), file upload flow, database operations end-to-end
- Files: No test directory visible
- Risk: Cannot verify frontend/backend integration works. Edge cases between components missed.
- Priority: MEDIUM - only caught in manual testing currently

**No Malicious Signature Detection Tests (High Risk):**
- What's not tested: File signature validation logic, bypass attempts, edge cases
- Files: `Backend/src/uploadSecurity.js` - no tests for malicious file detection
- Risk: Core security feature untested. Cannot verify malicious files actually rejected.
- Priority: HIGH - security critical

---

*Concerns audit: 2026-03-30*

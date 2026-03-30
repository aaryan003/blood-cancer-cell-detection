# Coding Conventions

**Analysis Date:** 2026-03-30

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `LoginPage.tsx`, `DashboardOverview.tsx`, `AuthController.js`)
- Services: camelCase (e.g., `authService.ts`)
- Models: PascalCase with "Model" suffix (e.g., `User.model.js`)
- Routes: camelCase (e.g., `auth.routes.js`)
- Controllers: PascalCase with "Controller" suffix (e.g., `AuthController.js`)
- UI components: PascalCase (e.g., `button.tsx`, `card.tsx`)

**Functions:**
- Standard camelCase naming: `loadCaptcha()`, `validateForm()`, `uploadSample()`, `generateCaptcha()`
- Class methods: camelCase, with static methods for service logic: `static async signup()`
- Handlers: camelCase with purpose prefix: `handleInputChange()`, `handleSubmit()`
- Middleware: verbNouns: `validateCaptcha()`, `validateFileContent()`, `uploadRateLimit()`

**Variables:**
- State variables: camelCase (e.g., `formData`, `isLoading`, `captchaAnswer`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_IMAGE_SIZE`, `ALLOWED_IMAGE_TYPES`)
- Boolean flags: prefix with `is` or `has`: `isLoading`, `showPassword`, `hasError`
- Data store objects: camelCase (e.g., `captchaStore`, `uploadAttempts`)

**Types:**
- Interfaces: PascalCase (e.g., `User`, `AuthResponse`, `Captcha`, `SignupData`, `LoginData`)
- Union types: SCREAMING_SNAKE_CASE for string literals (e.g., `'ADMIN' | 'DOCTOR' | 'LAB_TECH'`)
- Export type imports: `import type { ... }` syntax used throughout

## Code Style

**Formatting:**
- TypeScript files use strict mode: `"strict": true` in `tsconfig.json`
- Indentation: 2 spaces (implied by codebase)
- Line length: No hard limit observed, but generally readable
- Unused variables/parameters checked: `"noUnusedLocals": true`, `"noUnusedParameters": true`

**Linting:**
- ESLint configured with React hooks plugin
- Frontend only: ESLint with TypeScript parser and React refresh plugin
- Backend: No linting configuration found, plain JavaScript/Node.js with CommonJS-style imports (using ES modules with `"type": "module"`)

**File Organization:**
- Imports grouped by source: external libraries, then relative imports
- Type imports separated with `import type { ... }` syntax

## Import Organization

**Order:**
1. External packages (React, libraries): `import { ... } from 'react-router'`
2. Local modules and types: `import { authService } from '../services/authService'`
3. Type imports: `import type { User, AuthResponse } from '../types'`

**Path Aliases:**
- `@/*` maps to `./src/*` in TypeScript
- Example: `@/components`, `@/styles` (configured in Vite)
- Full paths used throughout codebase: `../constants`, `../services`, `../types`

## Error Handling

**Patterns:**
- Try-catch blocks with console.error logging: `console.error('Login error:', error)`
- Service methods throw errors, controllers catch and format responses
- API responses follow consistent structure: `{ success: boolean, message: string, data?: object, errors?: array }`
- Validation errors return first error for UX: `message: errors[0]` in controller
- Database error handling with Prisma error codes (e.g., `P2002` for unique constraint, `P1001` for connection)
- Middleware pattern for validation: error passed to next middleware via `next(error)`

**Example pattern from `AuthController.js`:**
```javascript
try {
  // Logic here
} catch (error) {
  console.error('Signup error:', error);
  if (error.code === 'P2002') {
    return res.status(409).json({ success: false, message: '...' });
  }
  res.status(500).json({ success: false, message: '...' });
}
```

## Logging

**Framework:** `console` object (no specialized logging framework)

**Patterns:**
- Error logging: `console.error('Module purpose:', error)`
- Warning logging: `console.warn('Backend not available, using mock response:', error)`
- Info logging: Startup messages with emojis in `server.js`: `console.log('🚀 ...')`
- Each module logs its own errors with context

## Comments

**When to Comment:**
- Section headers with `// Comment text` format: `// Security middleware`, `// CAPTCHA endpoint`
- Inline comments for complex logic (e.g., subtraction math in CAPTCHA generation)
- Comments on data structures (e.g., `// 5-minute expiry`)
- Purposeful comments only; code is generally self-documenting

**JSDoc/TSDoc:**
- No JSDoc comments observed in codebase
- TypeScript types provide documentation (interfaces explicitly define shapes)

## Function Design

**Size:**
- Most functions: 15-50 lines, focused on single responsibility
- Validation functions may be longer (45+ lines) when bundling related checks
- Class methods are compact, logic abstracted to service layer

**Parameters:**
- Destructured objects for multiple parameters: `{ name, email, password, role } = req.body`
- Generic types for async handlers: `async (req, res, next)`
- Consistency: static methods accept data objects, return results or throw

**Return Values:**
- Services: return data or throw errors
- Controllers: always return HTTP responses with consistent structure
- Functions: explicit returns, no implicit undefined
- Async functions: always return Promise (async/await pattern)

## Module Design

**Exports:**
- Named exports for functions/classes: `export class AuthService`, `export function LoginPage()`
- Singleton instances: `export const authService = new AuthService()`
- Default exports for components: `export default App`
- Barrel files used: `src/types/index.ts`, `src/constants/index.ts`, `src/services/` (implicit index pattern)

**Barrel Files:**
- `src/types/index.ts` exports all type definitions
- `src/constants/index.ts` exports APP_CONFIG, ROLES, API_ENDPOINTS
- Services imported directly: `from '../services/authService'`

## Validation Patterns

**Frontend (React):**
- Form-level validation in components before submission
- Validation functions return boolean: `validateForm(): boolean`
- Error state managed in component: `const [error, setError] = useState("")`
- Example from `LoginPage.tsx`: inline regex validation, clear error on user input

**Backend (Express):**
- Controller-level validation before service call
- Array collection of errors, return first for UX
- Validation helpers: regex patterns for email, name, password strength
- Example from `auth.controller.js`: comprehensive validation in signup with multiple checks

## Request/Response Format

**API Responses:**
```javascript
{
  success: boolean,
  message: string,
  data?: object,
  errors?: array,
  captcha?: { token: string, question: string }
}
```

**Error Responses:**
```javascript
{
  success: false,
  message: string,
  errors?: [string]
}
```

---

*Convention analysis: 2026-03-30*

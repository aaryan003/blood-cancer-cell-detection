# Testing Patterns

**Analysis Date:** 2026-03-30

## Test Framework

**Runner:**
- Not configured
- No test framework detected (Jest, Vitest, Mocha not in dependencies)

**Assertion Library:**
- Not detected

**Run Commands:**
- No test scripts defined in `package.json`

**Test Files:**
- None found in codebase (searched for `*.test.*` and `*.spec.*` files)

## Test File Organization

**Status:** No tests present in codebase

**Location:** N/A

**Naming:** N/A

**Structure:** N/A

## Testing Infrastructure Gaps

**Frontend (`F:/GUNI/SEM 8/Frontend`):**
- No test configuration in `package.json`
- No test files in component directory
- TypeScript strict mode enabled which provides some type safety: `"strict": true`
- ESLint configured to catch issues at lint time

**Backend (`F:/GUNI/SEM 8/Backend`):**
- No test framework in dependencies
- No test configuration files
- Manual validation only (console logging during development)

## Current Testing Approach

**Frontend Manual Testing:**
- Component validation through browser (React development environment)
- Form validation happens client-side in components
- Example from `LoginPage.tsx`: `validateForm()` function checks all fields before submission
- Error handling with state: `const [error, setError] = useState("")`

**Backend Manual Testing:**
- Console logging for debugging: `console.error()`, `console.warn()`
- Try-catch blocks in all endpoints with error logging
- Examples:
  - `AuthService` logs errors: `console.error('AuthService signup error:', error)`
  - Controllers catch and log: `console.error('Login error:', error)`
  - CAPTCHA generation logs failures: `console.error('CAPTCHA generation error:', error)`

## Validation Patterns (Proxy for Testing)

**Frontend Validation (`F:/GUNI/SEM 8/Frontend/src/components`):**

Example from `LoginPage.tsx` (lines 44-65):
```typescript
const validateForm = (): boolean => {
  if (!formData.email.trim()) {
    setError("Email address is required");
    return false;
  }

  const cleanEmail = formData.email.trim().replace(/^mailto:/, '').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    setError("Please enter a valid email address");
    return false;
  }
  if (!formData.password) {
    setError("Password is required");
    return false;
  }
  if (captcha && !captchaAnswer.trim()) {
    setError("Please answer the CAPTCHA question");
    return false;
  }
  return true;
};
```

**Backend Validation (`F:/GUNI/SEM 8/Backend/src/modules/auth`):**

Example from `AuthController.js` signup (lines 8-60):
```javascript
const errors = [];

// Name validation
if (!name || !name.trim()) {
  errors.push('Full name is required');
} else if (name.trim().length < 2) {
  errors.push('Name must be at least 2 characters long');
} else if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) {
  errors.push('Name can only contain letters, spaces, dots, hyphens and apostrophes');
}

// Email validation
if (!email || !email.trim()) {
  errors.push('Email address is required');
} else {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    errors.push('Invalid email format');
  }
}

if (errors.length > 0) {
  return res.status(400).json({
    success: false,
    message: errors[0],
    errors: errors
  });
}
```

## Error Handling as Testing

**Backend (`F:/GUNI/SEM 8/Backend`):**

Error handling pattern from `auth.service.js` (lines 34-60):
```javascript
static async login(loginData) {
  const { email, password } = loginData;
  try {
    const cleanEmail = email.replace(/^mailto:/, '').toLowerCase();
    const user = await UserModel.findByEmail(cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('AuthService login error:', error);
    throw error;
  }
}
```

**File Upload Validation (`F:/GUNI/SEM 8/Backend/src/uploadSecurity.js`):**

Comprehensive validation pattern (lines 63-128):
```javascript
export const validateFileContent = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    for (const [fieldName, files] of Object.entries(req.files)) {
      const fileArray = Array.isArray(files) ? files : [files];

      for (const file of fileArray) {
        // Check file size based on type
        if (fieldName === 'bloodCellImage' && file.size > MAX_IMAGE_SIZE) {
          return res.status(400).json({...});
        }

        // Check for malicious signatures
        const fileHeader = file.buffer.slice(0, 100).toString('ascii');
        const isMalicious = MALICIOUS_SIGNATURES.some(sig =>
          fileHeader.includes(sig) || file.buffer.slice(0, 10).includes(sig)
        );

        if (isMalicious) {
          return res.status(400).json({
            success: false,
            message: 'File rejected: Potentially malicious content detected'
          });
        }

        // Validate filename
        if (!/^[a-zA-Z0-9._-]+$/.test(file.originalname)) {
          return res.status(400).json({...});
        }
      }
    }
    next();
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({...});
  }
};
```

## Mocking Patterns

**Frontend Mock Backend (`F:/GUNI/SEM 8/Frontend/src/services/authService.ts`):**

When backend unavailable, service provides mock responses (lines 118-151):
```typescript
catch (error) {
  console.warn('Backend not available, using mock response:', error);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock login - check credentials in localStorage
  const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
  const user = existingUsers.find((u: any) =>
    u.email === data.email && u.password === data.password
  );

  if (!user) {
    return {
      success: false,
      error: 'Invalid email or password'
    };
  }

  localStorage.setItem('authToken', 'mock-token-' + user.id);
  return {
    success: true,
    data: { user: {...} }
  };
}
```

**Mock Data in Components:**

Example from `DashboardOverview.tsx` (lines 20-74):
```typescript
const stats = [
  {
    title: "Total Samples Processed",
    value: "1,547",
    change: "+12% from last month",
    icon: Activity,
    color: "blue",
  },
  // ... more mock data
];

const trendData = [
  { month: "Jan", detected: 45, total: 210 },
  { month: "Feb", detected: 52, total: 225 },
  // ... more mock data
];
```

## Captcha Testing Pattern

**Captcha Generation & Validation (`F:/GUNI/SEM 8/Backend/src/captcha.js`):**

Built-in validation middleware tests answer (lines 52-102):
```javascript
export const validateCaptcha = (req, res, next) => {
  try {
    const { captchaToken, captchaAnswer } = req.body;

    if (!captchaToken || !captchaAnswer) {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA token and answer are required'
      });
    }

    const captchaData = captchaStore.get(captchaToken);

    if (!captchaData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired CAPTCHA token'
      });
    }

    // Check if CAPTCHA expired
    if (Date.now() > captchaData.expires) {
      captchaStore.delete(captchaToken);
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA has expired. Please refresh and try again.'
      });
    }

    // Validate answer
    const userAnswer = parseInt(captchaAnswer);
    if (isNaN(userAnswer) || userAnswer !== captchaData.answer) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect CAPTCHA answer. Please try again.'
      });
    }

    captchaStore.delete(captchaToken);
    next();
  } catch (error) {
    console.error('CAPTCHA validation error:', error);
    res.status(500).json({
      success: false,
      message: 'CAPTCHA validation failed'
    });
  }
};
```

## Coverage

**Requirements:** None enforced

**View Coverage:** No coverage tools configured

## What's NOT Tested

**Critical gaps:**
- No unit tests for services (`auth.service.js`, `authService.ts`)
- No integration tests for auth flow
- No e2e tests
- No component tests for React components
- No middleware tests
- CAPTCHA logic tested only via runtime validation, no isolated tests
- File upload security tested only via middleware execution
- Password hashing not tested in isolation
- Prisma queries not tested

## Recommended Testing Patterns (Based on Codebase Structure)

**Unit Testing Pattern (if implemented):**
- Test `AuthService.signup()` and `AuthService.login()` with mock Prisma
- Test `validateForm()` in React components with React Testing Library
- Test utility functions (email regex, password validation)

**Integration Testing Pattern:**
- Test auth flow: signup → login → CAPTCHA validation
- Test file upload with various file types and sizes

**E2E Testing Pattern:**
- Test login/signup flow through UI
- Test file upload through dashboard

---

*Testing analysis: 2026-03-30*

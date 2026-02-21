# 🔄 CAPTCHA Flow Diagram

## Complete CAPTCHA Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. USER VISITS PAGE (Login/Signup/Upload)
   │
   ├─► Frontend: useEffect() triggers on mount
   │
   └─► Frontend: loadCaptcha() called
       │
       └─► GET /api/captcha
           │
           ├─► Backend: generateCaptcha()
           │   ├─► Generate random math problem (e.g., "7 + 3")
           │   ├─► Create unique token (crypto.randomBytes)
           │   ├─► Store in captchaStore Map with 5-min expiry
           │   └─► Return { token, question }
           │
           └─► Frontend: Display CAPTCHA question
               │
               └─► User sees: "What is 7 + 3?" with input field

2. USER FILLS FORM
   │
   ├─► Enter credentials/data
   ├─► Answer CAPTCHA (e.g., "10")
   └─► Click Submit

3. FORM SUBMISSION
   │
   ├─► Frontend: Validate form fields
   ├─► Frontend: Check CAPTCHA answer is not empty
   │
   └─► POST /api/auth/login (or signup/upload)
       │
       Body: {
         email: "user@example.com",
         password: "password123",
         captchaToken: "a1b2c3d4...",
         captchaAnswer: "10"
       }

4. BACKEND VALIDATION
   │
   ├─► Middleware: validateCaptcha()
   │   │
   │   ├─► Check captchaToken exists in request
   │   ├─► Check captchaAnswer exists in request
   │   │
   │   ├─► Lookup token in captchaStore
   │   │   ├─► Token not found? → Error: "Invalid or expired CAPTCHA"
   │   │   └─► Token found? → Continue
   │   │
   │   ├─► Check expiry time
   │   │   ├─► Expired? → Error: "CAPTCHA has expired"
   │   │   └─► Valid? → Continue
   │   │
   │   ├─► Validate answer
   │   │   ├─► Wrong answer? → Error: "Incorrect CAPTCHA answer"
   │   │   └─► Correct? → Continue
   │   │
   │   ├─► Delete token from store (one-time use)
   │   └─► Call next() → Proceed to auth/upload logic
   │
   └─► Controller: Process login/signup/upload

5. RESPONSE HANDLING
   │
   ├─► SUCCESS
   │   ├─► Backend: Return success response
   │   └─► Frontend: Navigate to dashboard/results
   │
   └─► ERROR
       ├─► Backend: Return error message
       └─► Frontend: 
           ├─► Display error to user
           └─► loadCaptcha() → Fetch new CAPTCHA

┌─────────────────────────────────────────────────────────────────┐
│                      CAPTCHA REFRESH FLOW                        │
└─────────────────────────────────────────────────────────────────┘

USER CLICKS REFRESH BUTTON
│
├─► Frontend: loadCaptcha() called
│
├─► GET /api/captcha
│   └─► Backend: Generate new CAPTCHA
│
├─► Frontend: Update captcha state
├─► Frontend: Clear captchaAnswer input
└─► User sees new question

┌─────────────────────────────────────────────────────────────────┐
│                    CAPTCHA CLEANUP PROCESS                       │
└─────────────────────────────────────────────────────────────────┘

AUTOMATIC CLEANUP (Every 10 minutes)
│
├─► Backend: setInterval(cleanExpiredCaptchas, 10 * 60 * 1000)
│
└─► Iterate through captchaStore
    ├─► Check each token's expiry time
    └─► Delete expired tokens

┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY FEATURES                           │
└─────────────────────────────────────────────────────────────────┘

✅ ONE-TIME USE
   └─► Token deleted after successful validation
   └─► Cannot reuse same CAPTCHA token

✅ TIME-LIMITED
   └─► 5-minute expiry from generation
   └─► Prevents token hoarding

✅ CRYPTOGRAPHICALLY SECURE
   └─► crypto.randomBytes(16) for token generation
   └─► Unpredictable tokens

✅ IN-MEMORY STORAGE
   └─► Fast validation
   └─► Automatic cleanup on server restart

✅ RATE LIMITING
   └─► Combined with express-rate-limit
   └─► Prevents CAPTCHA farming

┌─────────────────────────────────────────────────────────────────┐
│                    PROTECTED ENDPOINTS                           │
└─────────────────────────────────────────────────────────────────┘

POST /api/auth/login
├─► Middleware: validateCaptcha
└─► Controller: AuthController.login

POST /api/auth/signup
├─► Middleware: validateCaptcha
└─► Controller: AuthController.signup

POST /api/upload/sample
├─► Middleware: uploadRateLimit
├─► Middleware: validateCaptcha ← CAPTCHA HERE
├─► Middleware: uploadFiles
├─► Middleware: handleUploadError
├─► Middleware: validateFileContent
└─► Controller: UploadController.uploadSample

┌─────────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIOS                             │
└─────────────────────────────────────────────────────────────────┘

❌ Missing CAPTCHA Token
   └─► "CAPTCHA token and answer are required"

❌ Missing CAPTCHA Answer
   └─► "CAPTCHA token and answer are required"

❌ Invalid Token
   └─► "Invalid or expired CAPTCHA token"

❌ Expired Token
   └─► "CAPTCHA has expired. Please refresh and try again."

❌ Wrong Answer
   └─► "Incorrect CAPTCHA answer. Please try again."

❌ Network Error
   └─► "Network error. Please check your connection and try again."
   └─► Frontend: Auto-refresh CAPTCHA

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                           │
└─────────────────────────────────────────────────────────────────┘

LoginPage.tsx
├─► State: captcha, captchaAnswer
├─► useEffect: loadCaptcha() on mount
├─► UI: CAPTCHA question + input + refresh button
└─► Submit: Include captchaToken & captchaAnswer

SignupPage.tsx
├─► State: captcha, captchaAnswer
├─► useEffect: loadCaptcha() on mount
├─► UI: CAPTCHA question + input + refresh button
└─► Submit: Include captchaToken & captchaAnswer

UploadDiagnosis.tsx
├─► State: captcha, captchaAnswer
├─► useEffect: loadCaptcha() on mount
├─► UI: CAPTCHA question + input + refresh button
└─► Submit: Include captchaToken & captchaAnswer

┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND STRUCTURE                             │
└─────────────────────────────────────────────────────────────────┘

captcha.js
├─► captchaStore: Map<token, {answer, expires}>
├─► generateCaptcha(req, res)
├─► validateCaptcha(req, res, next)
└─► cleanExpiredCaptchas()

app.js
└─► GET /api/captcha → generateCaptcha

auth.routes.js
├─► POST /api/auth/login → validateCaptcha → AuthController.login
└─► POST /api/auth/signup → validateCaptcha → AuthController.signup

upload.routes.js
└─► POST /api/upload/sample → validateCaptcha → UploadController.uploadSample
```

## 🎯 Key Points

1. **Automatic Loading**: CAPTCHA loads automatically when page mounts
2. **User-Friendly**: Clear questions, easy refresh, helpful errors
3. **Secure**: One-time tokens, time-limited, cryptographically secure
4. **Comprehensive**: Protects all critical endpoints
5. **Error Handling**: Auto-refresh on errors, clear error messages
6. **Performance**: In-memory storage, automatic cleanup

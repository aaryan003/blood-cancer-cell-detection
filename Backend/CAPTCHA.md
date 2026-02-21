# 🤖 CAPTCHA Security Implementation

## Features Added

### ✅ Math-based CAPTCHA
- Simple addition/subtraction problems (1-10)
- 5-minute expiry time
- One-time use tokens
- Automatic cleanup of expired CAPTCHAs

### ✅ Protected Endpoints
- **Login**: Requires CAPTCHA validation
- **Signup**: Requires CAPTCHA validation  
- **File Upload**: Requires CAPTCHA validation

## API Endpoints

### 1. Get CAPTCHA
**GET** `/api/captcha`

**Response:**
```json
{
  "success": true,
  "captcha": {
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "question": "What is 7 + 3?"
  }
}
```

### 2. Login with CAPTCHA
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "captchaToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "captchaAnswer": "10"
}
```

### 3. Signup with CAPTCHA
**POST** `/api/auth/signup`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "DOCTOR",
  "captchaToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "captchaAnswer": "10"
}
```

### 4. Upload with CAPTCHA
**POST** `/api/upload/sample`

**Form Data:**
```
bloodCellImage: [file]
sampleId: "BCS-2024-001"
patientAge: "45"
patientGender: "male"
hospitalId: "HSP-001"
captchaToken: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
captchaAnswer: "10"
```

## Testing CAPTCHA

### 1. Test CAPTCHA Generation
```bash
curl http://localhost:3000/api/captcha
```

### 2. Test Login with CAPTCHA
```bash
# First get CAPTCHA
curl http://localhost:3000/api/captcha

# Then login with CAPTCHA
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"SecurePass123!\",\"captchaToken\":\"TOKEN_HERE\",\"captchaAnswer\":\"ANSWER_HERE\"}"
```

### 3. Test Wrong CAPTCHA Answer
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"SecurePass123!\",\"captchaToken\":\"TOKEN_HERE\",\"captchaAnswer\":\"999\"}"
```

## Error Responses

### Missing CAPTCHA
```json
{
  "success": false,
  "message": "CAPTCHA token and answer are required"
}
```

### Wrong Answer
```json
{
  "success": false,
  "message": "Incorrect CAPTCHA answer. Please try again."
}
```

### Expired CAPTCHA
```json
{
  "success": false,
  "message": "CAPTCHA has expired. Please refresh and try again."
}
```

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or expired CAPTCHA token"
}
```

## Frontend Integration

Add CAPTCHA to your React forms:

```javascript
const [captcha, setCaptcha] = useState(null);
const [captchaAnswer, setCaptchaAnswer] = useState('');

// Get CAPTCHA on component mount
useEffect(() => {
  fetchCaptcha();
}, []);

const fetchCaptcha = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/captcha');
    const data = await response.json();
    setCaptcha(data.captcha);
  } catch (error) {
    console.error('Failed to fetch CAPTCHA:', error);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = {
    email,
    password,
    captchaToken: captcha.token,
    captchaAnswer: parseInt(captchaAnswer)
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Login successful
    } else {
      // Show error and refresh CAPTCHA
      fetchCaptcha();
      setCaptchaAnswer('');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// In your JSX
<div>
  <label>{captcha?.question}</label>
  <input 
    type="number" 
    value={captchaAnswer}
    onChange={(e) => setCaptchaAnswer(e.target.value)}
    placeholder="Enter answer"
    required
  />
  <button type="button" onClick={fetchCaptcha}>
    Refresh CAPTCHA
  </button>
</div>
```

## Security Benefits

✅ **Bot Protection**: Prevents automated attacks
✅ **Spam Prevention**: Reduces spam registrations/uploads
✅ **Brute Force Mitigation**: Adds extra layer to rate limiting
✅ **Human Verification**: Ensures real users are interacting

## Production Enhancements

1. **Visual CAPTCHA**: Use image-based CAPTCHAs
2. **reCAPTCHA**: Integrate Google reCAPTCHA v3
3. **Redis Storage**: Store CAPTCHA data in Redis
4. **Difficulty Scaling**: Increase difficulty after failed attempts
5. **Audio CAPTCHA**: Add accessibility support

Your system now has CAPTCHA protection! 🤖🔒
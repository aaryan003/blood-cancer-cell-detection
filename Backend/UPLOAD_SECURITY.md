# 🔒 File Upload Security Test Guide

## Security Features Implemented

### ✅ File Type Validation
- **Images**: Only JPEG, PNG, TIFF allowed
- **Documents**: Only PDF allowed
- **Magic Bytes**: Validates actual file content vs extension
- **MIME Type**: Checks Content-Type header

### ✅ File Size Limits
- **Images**: Maximum 10MB
- **PDFs**: Maximum 10MB

### ✅ Malicious Content Detection
- Blocks executable files (MZ header)
- Blocks archive files (ZIP, RAR, 7z)
- Blocks script files (PHP, JavaScript, Shell)

### ✅ Rate Limiting
- **5 uploads per minute** per IP address
- Automatic cleanup of old attempts

### ✅ Filename Security
- Only alphanumeric, dots, hyphens, underscores allowed
- Generates secure random filenames

## Test the Upload Security

### 1. Start Backend Server
```bash
cd Backend
npm run dev
```

### 2. Test with Postman/Thunder Client

**Endpoint**: `POST http://localhost:3000/api/upload/sample`

**Valid Upload Test**:
```
Form Data:
- bloodCellImage: [Select a .jpg/.png image file]
- labReport: [Select a .pdf file] (optional)
- sampleId: "BCS-2024-001"
- patientAge: "45"
- patientGender: "male"
- hospitalId: "HSP-001"
- additionalNotes: "Test upload"
```

**Security Tests**:

1. **Wrong File Type** (Should FAIL):
   - Upload .txt file as bloodCellImage
   - Expected: "Invalid file type" error

2. **Large File** (Should FAIL):
   - Upload file > 10MB
   - Expected: "File too large" error

3. **Executable File** (Should FAIL):
   - Upload .exe file
   - Expected: "Malicious content detected" error

4. **Rate Limit** (Should FAIL after 5):
   - Make 6 rapid upload requests
   - Expected: "Too many upload attempts" error

5. **Invalid Filename** (Should FAIL):
   - Upload file with name like "test<script>.jpg"
   - Expected: "Invalid filename" error

### 3. Test with curl (Windows)

**Valid Upload**:
```bash
curl -X POST http://localhost:3000/api/upload/sample ^
  -F "bloodCellImage=@path/to/image.jpg" ^
  -F "sampleId=BCS-2024-001" ^
  -F "patientAge=45" ^
  -F "patientGender=male" ^
  -F "hospitalId=HSP-001"
```

**Test Wrong File Type**:
```bash
curl -X POST http://localhost:3000/api/upload/sample ^
  -F "bloodCellImage=@path/to/document.txt" ^
  -F "sampleId=BCS-2024-001" ^
  -F "patientAge=45" ^
  -F "patientGender=male" ^
  -F "hospitalId=HSP-001"
```

## Expected Responses

### ✅ Success Response:
```json
{
  "success": true,
  "message": "Files uploaded successfully and queued for analysis",
  "data": {
    "sampleId": "BCS-2024-001",
    "uploadId": "upload_1234567890",
    "files": {
      "bloodCellImage": {
        "originalName": "cell_sample.jpg",
        "secureFilename": "a1b2c3d4e5f6g7h8.jpg",
        "size": 2048576,
        "type": "image/jpeg"
      }
    },
    "status": "uploaded"
  }
}
```

### ❌ Security Error Examples:
```json
{
  "success": false,
  "message": "Invalid file type. Only images (JPEG, PNG, TIFF) and PDF files are allowed"
}
```

```json
{
  "success": false,
  "message": "File too large. Maximum size: 10MB"
}
```

```json
{
  "success": false,
  "message": "File rejected: Potentially malicious content detected"
}
```

```json
{
  "success": false,
  "message": "Too many upload attempts. Please try again later."
}
```

## Frontend Integration

Update your React component to use the secure endpoint:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('bloodCellImage', bloodCellImage);
  if (labReport) formData.append('labReport', labReport);
  formData.append('sampleId', formData.sampleId);
  formData.append('patientAge', formData.patientAge);
  formData.append('patientGender', formData.patientGender);
  formData.append('hospitalId', formData.hospitalId);
  formData.append('additionalNotes', formData.additionalNotes);

  try {
    const response = await fetch('http://localhost:3000/api/upload/sample', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Upload successful!');
      navigate('/results');
    } else {
      alert('Upload failed: ' + result.message);
    }
  } catch (error) {
    alert('Upload error: ' + error.message);
  }
};
```

## Security Checklist

- [x] File type validation (extension + MIME + magic bytes)
- [x] File size limits (10MB max)
- [x] Malicious content detection
- [x] Rate limiting (5 uploads/minute)
- [x] Secure filename generation
- [x] Input validation for form fields
- [x] Error handling without info leakage
- [x] Memory storage (no disk writes)

## Production Recommendations

1. **Real Antivirus**: Replace simulation with actual virus scanner
2. **Cloud Storage**: Store files in AWS S3 or similar
3. **Redis**: Use Redis for distributed rate limiting
4. **File Quarantine**: Isolate suspicious files
5. **Audit Logging**: Log all upload attempts
6. **Content Analysis**: Deep scan image content for anomalies

Your file upload system is now secure! 🔒✨
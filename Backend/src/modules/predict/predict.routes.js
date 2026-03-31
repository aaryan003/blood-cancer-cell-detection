import { Router } from 'express';
import { PredictController } from './predict.controller.js';
import { uploadFiles, validateFileContent, uploadRateLimit, handleUploadError } from '../../uploadSecurity.js';

const router = Router();

// POST /api/predict — upload a blood cell image, forward to ML service, persist Diagnosis
// Note: validateCaptcha is intentionally omitted; prediction is a backend-to-backend operation
router.post(
  '/',
  uploadRateLimit,        // Rate limiting: max 5 uploads/min per IP
  uploadFiles,            // Multer: parse multipart/form-data into req.files
  handleUploadError,      // Convert multer errors to JSON responses
  validateFileContent,    // Deep content validation (MIME, size, malicious signatures)
  PredictController.predict
);

export default router;

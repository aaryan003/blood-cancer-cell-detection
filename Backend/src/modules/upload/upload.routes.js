import { Router } from 'express';
import { UploadController } from './upload.controller.js';
import { uploadFiles, validateFileContent, uploadRateLimit, handleUploadError } from '../../uploadSecurity.js';

const router = Router();

// POST /api/upload/sample - Upload blood cell sample with security
router.post('/sample',
  uploadRateLimit,           // Rate limiting
  uploadFiles,               // File upload handling
  handleUploadError,         // Error handling
  validateFileContent,       // Content validation
  UploadController.uploadSample
);

export default router;

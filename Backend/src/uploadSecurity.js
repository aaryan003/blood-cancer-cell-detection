import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PDF_SIZE = 10 * 1024 * 1024;   // 10MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

// Malicious file signatures to block
const MALICIOUS_SIGNATURES = [
  'MZ',      // Windows executable
  '7zXZ',    // 7-Zip archive
  'Rar!',    // RAR archive
  'PK',      // ZIP archive (could contain malware)
  '#!/bin/', // Shell script
  '<?php',   // PHP script
  '<script', // JavaScript
];

// Storage configuration
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.tiff', '.pdf'];
    
    if (!allowedExts.includes(ext)) {
      return cb(new Error(`Invalid file extension. Allowed: ${allowedExts.join(', ')}`), false);
    }

    // Check MIME type
    const isValidImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isValidPDF = ALLOWED_PDF_TYPES.includes(file.mimetype);
    
    if (!isValidImage && !isValidPDF) {
      return cb(new Error('Invalid file type. Only images (JPEG, PNG, TIFF) and PDF files are allowed'), false);
    }

    cb(null, true);
  } catch (error) {
    cb(new Error('File validation failed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 2, // Max 2 files (image + PDF)
  }
});

// Advanced file validation middleware
export const validateFileContent = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Validate each uploaded file
    for (const [fieldName, files] of Object.entries(req.files)) {
      const fileArray = Array.isArray(files) ? files : [files];
      
      for (const file of fileArray) {
        // Check file size based on type
        if (fieldName === 'bloodCellImage' && file.size > MAX_IMAGE_SIZE) {
          return res.status(400).json({
            success: false,
            message: `Image file too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
          });
        }
        
        if (fieldName === 'labReport' && file.size > MAX_PDF_SIZE) {
          return res.status(400).json({
            success: false,
            message: `PDF file too large. Maximum size: ${MAX_PDF_SIZE / 1024 / 1024}MB`
          });
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
          return res.status(400).json({
            success: false,
            message: 'Invalid filename. Only alphanumeric characters, dots, hyphens, and underscores allowed.'
          });
        }

        // Generate secure filename
        const fileExt = path.extname(file.originalname);
        const secureFilename = crypto.randomBytes(16).toString('hex') + fileExt;
        file.secureFilename = secureFilename;
      }
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({
      success: false,
      message: 'File validation failed'
    });
  }
};

// Rate limiting for uploads
export const uploadRateLimit = (req, res, next) => {
  const uploads = global.uploadAttempts || new Map();
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxUploads = 5; // 5 uploads per minute

  // Clean old entries
  for (const [ip, attempts] of uploads.entries()) {
    uploads.set(ip, attempts.filter(time => now - time < windowMs));
    if (uploads.get(ip).length === 0) {
      uploads.delete(ip);
    }
  }

  // Check current IP
  const currentAttempts = uploads.get(clientIP) || [];
  if (currentAttempts.length >= maxUploads) {
    return res.status(429).json({
      success: false,
      message: 'Too many upload attempts. Please try again later.'
    });
  }

  // Record this attempt
  currentAttempts.push(now);
  uploads.set(clientIP, currentAttempts);
  global.uploadAttempts = uploads;

  next();
};

// Main upload middleware
export const uploadFiles = upload.fields([
  { name: 'bloodCellImage', maxCount: 1 },
  { name: 'labReport', maxCount: 1 }
]);

// Error handler for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size: 10MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum: 2 files'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message
        });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};
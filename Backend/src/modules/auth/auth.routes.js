import { Router } from 'express';
import { AuthController } from './auth.controller.js';
// CAPTCHA temporarily disabled for development
// import { validateCaptcha } from '../../captcha.js';

const router = Router();

// POST /api/auth/signup - CAPTCHA disabled
router.post('/signup', AuthController.signup);

// POST /api/auth/login - CAPTCHA disabled
router.post('/login', AuthController.login);

// GET /api/auth/profile?userId=...
router.get('/profile', AuthController.getProfile);

// PUT /api/auth/profile?userId=...
router.put('/profile', AuthController.updateProfile);

export default router;

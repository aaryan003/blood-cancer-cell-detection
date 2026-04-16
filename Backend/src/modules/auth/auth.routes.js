import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRecaptcha } from '../../captcha.js';

const router = Router();

// POST /api/auth/signup - with Google reCAPTCHA verification
router.post('/signup', validateRecaptcha, AuthController.signup);

// POST /api/auth/login - with Google reCAPTCHA verification
router.post('/login', validateRecaptcha, AuthController.login);

// GET /api/auth/profile?userId=...
router.get('/profile', AuthController.getProfile);

// PUT /api/auth/profile?userId=...
router.put('/profile', AuthController.updateProfile);

export default router;

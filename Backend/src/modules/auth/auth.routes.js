import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateCaptcha } from '../../captcha.js';

const router = Router();

// POST /api/auth/signup - with CAPTCHA
router.post('/signup', validateCaptcha, AuthController.signup);

// POST /api/auth/login - with CAPTCHA
router.post('/login', validateCaptcha, AuthController.login);

// GET /api/auth/profile?userId=...
router.get('/profile', AuthController.getProfile);

// PUT /api/auth/profile?userId=...
router.put('/profile', AuthController.updateProfile);

export default router;

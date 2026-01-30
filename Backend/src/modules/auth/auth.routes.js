import { Router } from 'express';
import { AuthController } from './auth.controller.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', AuthController.signup);

// POST /api/auth/login
router.post('/login', AuthController.login);

export default router;
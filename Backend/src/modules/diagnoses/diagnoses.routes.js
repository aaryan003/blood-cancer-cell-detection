import { Router } from 'express';
import { DiagnosesController } from './diagnoses.controller.js';

const router = Router();

// GET /api/diagnoses
router.get('/', DiagnosesController.getAll);

export default router;

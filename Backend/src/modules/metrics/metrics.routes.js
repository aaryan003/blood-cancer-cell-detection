import { Router } from 'express';
import { MetricsController } from './metrics.controller.js';

const router = Router();

// GET /api/metrics
router.get('/', MetricsController.getAll);

export default router;

import { Router } from 'express';
import { ReportsController } from './reports.controller.js';

const router = Router();

// GET /api/reports
router.get('/', ReportsController.getAll);

export default router;

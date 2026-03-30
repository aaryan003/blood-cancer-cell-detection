import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', DashboardController.getStats);

// GET /api/dashboard/trends
router.get('/trends', DashboardController.getTrends);

// GET /api/dashboard/hospitals
router.get('/hospitals', DashboardController.getHospitalDistribution);

export default router;

import { Router } from 'express';
import { AuditLogsController } from './auditLogs.controller.js';

const router = Router();

// GET /api/audit-logs
router.get('/', AuditLogsController.getAll);

export default router;

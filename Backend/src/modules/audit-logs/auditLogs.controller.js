import { AuditLogsService } from './auditLogs.service.js';

export class AuditLogsController {
  static async getAll(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await AuditLogsService.getAll({ page, limit });
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('AuditLogsController.getAll error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

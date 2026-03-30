import { ReportsService } from './reports.service.js';

export class ReportsController {
  static async getAll(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await ReportsService.getAll({ page, limit });
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('ReportsController.getAll error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

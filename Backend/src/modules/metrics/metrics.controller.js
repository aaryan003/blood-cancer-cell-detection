import { MetricsService } from './metrics.service.js';

export class MetricsController {
  static async getAll(req, res) {
    try {
      const records = await MetricsService.getAll();
      res.json({ success: true, data: records });
    } catch (error) {
      console.error('MetricsController.getAll error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

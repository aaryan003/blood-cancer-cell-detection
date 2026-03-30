import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  static async getStats(req, res) {
    try {
      const data = await DashboardService.getStats();
      res.json({ success: true, data });
    } catch (error) {
      console.error('DashboardController.getStats error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getTrends(req, res) {
    try {
      const data = await DashboardService.getTrends();
      res.json({ success: true, data });
    } catch (error) {
      console.error('DashboardController.getTrends error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getHospitalDistribution(req, res) {
    try {
      const data = await DashboardService.getHospitalDistribution();
      res.json({ success: true, data });
    } catch (error) {
      console.error('DashboardController.getHospitalDistribution error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

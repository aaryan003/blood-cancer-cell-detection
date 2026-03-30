import { DiagnosesService } from './diagnoses.service.js';

export class DiagnosesController {
  static async getAll(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await DiagnosesService.getAll({ page, limit });
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('DiagnosesController.getAll error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

import prisma from '../../config/prisma.js';

export class MetricsService {
  static async getAll() {
    const records = await prisma.modelMetrics.findMany({
      orderBy: { evaluatedAt: 'desc' },
    });
    return records;
  }
}

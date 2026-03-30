import prisma from '../../config/prisma.js';

export class DiagnosesService {
  static async getAll({ page = 1, limit = 10 } = {}) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.diagnosis.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          report: {
            include: {
              patient: {
                include: {
                  hospital: true,
                },
              },
            },
          },
        },
      }),
      prisma.diagnosis.count(),
    ]);

    const data = records.map((d) => ({
      id: d.id,
      result: d.result,
      confidence: d.confidence,
      modelName: d.modelName,
      cellBreakdown: d.cellBreakdown,
      heatmapUrl: d.heatmapUrl,
      createdAt: d.createdAt,
      patientName: d.report.patient.name,
      sampleId: d.report.sampleId,
      hospitalName: d.report.patient.hospital.name,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

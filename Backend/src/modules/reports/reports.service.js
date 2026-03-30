import prisma from '../../config/prisma.js';

export class ReportsService {
  static async getAll({ page = 1, limit = 10 } = {}) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            include: {
              hospital: true,
            },
          },
          diagnosis: {
            select: {
              result: true,
              confidence: true,
            },
          },
        },
      }),
      prisma.report.count(),
    ]);

    const data = records.map((r) => ({
      id: r.id,
      sampleId: r.sampleId,
      reportUrl: r.reportUrl,
      createdAt: r.createdAt,
      patientName: r.patient.name,
      patientAge: r.patient.age,
      patientGender: r.patient.gender,
      hospitalName: r.patient.hospital.name,
      diagnosisResult: r.diagnosis?.result || null,
      diagnosisConfidence: r.diagnosis?.confidence || null,
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

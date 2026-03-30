import prisma from '../../config/prisma.js';

export class DashboardService {
  static async getStats() {
    const [totalSamples, totalDiagnoses, cancerousDiagnoses, pendingDiagnoses, modelAccuracyResult] =
      await Promise.all([
        prisma.upload.count(),
        prisma.diagnosis.count(),
        prisma.diagnosis.count({ where: { result: 'Cancerous' } }),
        prisma.report.count({ where: { diagnosis: null } }),
        prisma.modelMetrics.aggregate({ _avg: { accuracy: true } }),
      ]);

    const detectionRate =
      totalDiagnoses > 0
        ? (cancerousDiagnoses / totalDiagnoses) * 100
        : 0;

    const modelAccuracy = modelAccuracyResult._avg.accuracy ?? 0;

    return {
      totalSamples,
      detectionRate,
      pendingDiagnoses,
      modelAccuracy,
    };
  }

  static async getTrends() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const diagnoses = await prisma.diagnosis.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { result: true, createdAt: true },
    });

    // Group by YYYY-MM in JavaScript (SQLite lacks native date groupBy)
    const monthMap = {};
    for (const d of diagnoses) {
      const month = d.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
      if (!monthMap[month]) {
        monthMap[month] = { month, cancerous: 0, nonCancerous: 0 };
      }
      if (d.result === 'Cancerous') {
        monthMap[month].cancerous += 1;
      } else {
        monthMap[month].nonCancerous += 1;
      }
    }

    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
  }

  static async getHospitalDistribution() {
    const hospitals = await prisma.hospital.findMany({
      include: {
        patients: {
          include: {
            reports: {
              include: { diagnosis: true },
            },
          },
        },
      },
    });

    return hospitals.map((hospital) => {
      let totalSamples = 0;
      let cancerousCount = 0;
      let totalDiagnoses = 0;

      for (const patient of hospital.patients) {
        for (const report of patient.reports) {
          totalSamples += 1;
          if (report.diagnosis) {
            totalDiagnoses += 1;
            if (report.diagnosis.result === 'Cancerous') {
              cancerousCount += 1;
            }
          }
        }
      }

      const detectionRate =
        totalDiagnoses > 0 ? (cancerousCount / totalDiagnoses) * 100 : 0;

      return {
        name: hospital.name,
        totalSamples,
        cancerousCount,
        detectionRate,
      };
    });
  }
}

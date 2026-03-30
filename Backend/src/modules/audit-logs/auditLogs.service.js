import prisma from '../../config/prisma.js';

export class AuditLogsService {
  static async getAll({ page = 1, limit = 10 } = {}) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    const data = records.map((a) => ({
      id: a.id,
      action: a.action,
      ipAddress: a.ipAddress,
      createdAt: a.createdAt,
      userName: a.user.name,
      userEmail: a.user.email,
      userRole: a.user.role,
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

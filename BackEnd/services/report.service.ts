import { prisma } from '../config/database';
import { CreateReportDto } from '../dtos/entities.dto';
import { ApiError } from '../types/errors';
import { ReportStatus } from '@prisma/client';
import { buildPaginationMeta } from '../utils/response';

export class ReportService {
  async getAll(page: number, limit: number, status?: ReportStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
          campaign: { select: { id: true, title: true, slug: true } },
          comment: { select: { id: true, content: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, meta: buildPaginationMeta(total, page, limit) };
  }

  async create(dto: CreateReportDto, reporterId: string) {
    return prisma.report.create({
      data: {
        reporterId,
        campaignId: dto.campaignId ?? null,
        commentId: dto.commentId ?? null,
        reason: dto.reason,
        description: dto.description ?? null,
      },
    });
  }

  async resolve(id: string, adminId: string, status: 'RESOLVED' | 'DISMISSED') {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) throw ApiError.notFound('Report');

    return prisma.report.update({
      where: { id },
      data: { status, resolvedAt: new Date(), resolvedBy: adminId },
    });
  }
}

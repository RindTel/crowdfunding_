import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class CommentRepository {
  async findByCampaign(campaignId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.CommentWhereInput = {
      campaignId,
      parentId: null,
      deletedAt: null,
      isHidden: false,
    };
    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          replies: {
            where: { deletedAt: null, isHidden: false },
            take: 5,
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
          },
          _count: { select: { replies: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);
    return { comments, total };
  }

  async create(data: Prisma.CommentCreateInput) {
    return prisma.comment.create({
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.comment.findFirst({ where: { id, deletedAt: null } });
  }

  async update(id: string, content: string) {
    return prisma.comment.update({ where: { id }, data: { content } });
  }

  async softDelete(id: string) {
    return prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async incrementLikes(id: string) {
    return prisma.comment.update({ where: { id }, data: { likesCount: { increment: 1 } } });
  }
}

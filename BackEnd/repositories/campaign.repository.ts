import { prisma } from '../config/database';
import { CampaignStatus, Prisma } from '@prisma/client';
import { CampaignQueryDto } from '../dtos/campaign.dto';

export class CampaignRepository {
  async findAll(query: CampaignQueryDto) {
    const { page, limit, status, categoryId, search, creatorId, isFeatured, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(creatorId && { creatorId }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [campaigns, total] = await prisma.$transaction([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
          category: true,
          _count: { select: { donations: true, comments: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return { campaigns, total };
  }

  async findById(id: string) {
    return prisma.campaign.findFirst({
      where: { id, deletedAt: null },
      include: {
        creator: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
        category: true,
        rewards: { where: { deletedAt: null }, orderBy: { minimumAmount: 'asc' } },
        updates: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5 },
        _count: { select: { donations: true, comments: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.campaign.findFirst({
      where: { slug, deletedAt: null },
      include: {
        creator: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
        category: true,
        rewards: { where: { deletedAt: null }, orderBy: { minimumAmount: 'asc' } },
        updates: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        _count: { select: { donations: true, comments: true } },
      },
    });
  }

  async create(data: Prisma.CampaignCreateInput) {
    return prisma.campaign.create({
      data,
      include: { category: true, creator: true },
    });
  }

  async update(id: string, data: Prisma.CampaignUpdateInput) {
    return prisma.campaign.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async softDelete(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { deletedAt: new Date(), status: CampaignStatus.CANCELLED },
    });
  }

  async incrementViews(id: string) {
    return prisma.campaign.update({ where: { id }, data: { viewsCount: { increment: 1 } } });
  }

  async updateFundingStats(id: string, amount: number) {
    return prisma.campaign.update({
      where: { id },
      data: {
        raisedAmount: { increment: amount },
        donationsCount: { increment: 1 },
      },
    });
  }

  async slugExists(slug: string) {
    const count = await prisma.campaign.count({ where: { slug, deletedAt: null } });
    return count > 0;
  }
}

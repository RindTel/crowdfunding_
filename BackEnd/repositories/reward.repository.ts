import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class RewardRepository {
  async findByCampaign(campaignId: string) {
    return prisma.reward.findMany({
      where: { campaignId, deletedAt: null },
      orderBy: { minimumAmount: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.reward.findFirst({ where: { id, deletedAt: null } });
  }

  async create(data: Prisma.RewardCreateInput) {
    return prisma.reward.create({ data });
  }

  async update(id: string, data: Prisma.RewardUpdateInput) {
    return prisma.reward.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.reward.update({ where: { id }, data: { deletedAt: new Date(), isAvailable: false } });
  }
}

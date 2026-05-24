import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class UpdateRepository {
  async findByCampaign(campaignId: string) {
    return prisma.update.findMany({
      where: { campaignId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.update.findFirst({ where: { id, deletedAt: null } });
  }

  async create(data: Prisma.UpdateCreateInput) {
    return prisma.update.create({ data });
  }

  async update(id: string, data: Prisma.UpdateUpdateInput) {
    return prisma.update.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.update.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

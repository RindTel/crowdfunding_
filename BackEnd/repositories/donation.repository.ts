import { prisma } from '../config/database';
import { Prisma, DonationStatus } from '@prisma/client';
import { DonationQueryDto } from '../dtos/donation.dto';

export class DonationRepository {
  async findAll(query: DonationQueryDto) {
    const { page, limit, campaignId, donorId, status, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DonationWhereInput = {
      ...(campaignId && { campaignId }),
      ...(donorId && { donorId }),
      ...(status && { status }),
    };

    const [donations, total] = await prisma.$transaction([
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: {
          campaign: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
          donor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
          reward: { select: { id: true, title: true } },
          payment: true,
        },
      }),
      prisma.donation.count({ where }),
    ]);

    return { donations, total };
  }

  async findById(id: string) {
    return prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: true,
        donor: { include: { user: true } },
        reward: true,
        payment: true,
      },
    });
  }

  async create(data: Prisma.DonationCreateInput) {
    return prisma.donation.create({
      data,
      include: { campaign: true, reward: true },
    });
  }

  async updateStatus(id: string, status: DonationStatus) {
    return prisma.donation.update({ where: { id }, data: { status } });
  }

  async getCampaignDonationStats(campaignId: string) {
    return prisma.donation.aggregate({
      where: { campaignId, status: DonationStatus.COMPLETED },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });
  }

  async getDonorStats(donorId: string) {
    return prisma.donation.aggregate({
      where: { donorId, status: DonationStatus.COMPLETED },
      _sum: { amount: true },
      _count: { id: true },
    });
  }

  async getTopDonors(campaignId: string, limit = 10) {
    return prisma.donation.groupBy({
      by: ['donorId'],
      where: { campaignId, status: DonationStatus.COMPLETED, isAnonymous: false },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });
  }

  async getRecentDonations(campaignId: string, limit = 10) {
    return prisma.donation.findMany({
      where: { campaignId, status: DonationStatus.COMPLETED },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        donor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        reward: { select: { title: true } },
      },
    });
  }
}

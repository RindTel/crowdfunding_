import { prisma } from '../config/database';
import { CampaignStatus, DonationStatus } from '@prisma/client';

export class AnalyticsRepository {
  async getAdminStats() {
    const [
      totalUsers,
      totalCampaigns,
      activeCampaigns,
      donationAgg,
      recentDonations,
      campaignsByStatus,
      topCampaigns,
    ] = await prisma.$transaction([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.campaign.count({ where: { deletedAt: null } }),
      prisma.campaign.count({ where: { status: CampaignStatus.ACTIVE, deletedAt: null } }),
      prisma.donation.aggregate({
        where: { status: DonationStatus.COMPLETED },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: { status: DonationStatus.COMPLETED },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { title: true, slug: true } },
          donor: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.campaign.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.campaign.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { raisedAmount: 'desc' },
        include: { category: true },
      }),
    ]);

    return {
      totalUsers,
      totalCampaigns,
      activeCampaigns,
      totalRevenue: donationAgg._sum.amount ?? 0,
      totalDonations: donationAgg._count.id,
      recentDonations,
      campaignsByStatus,
      topCampaigns,
    };
  }

  async getCreatorStats(creatorId: string) {
    const [campaigns, donationAgg, recentDonations, monthlyRevenue] = await prisma.$transaction([
      prisma.campaign.findMany({
        where: { creatorId, deletedAt: null },
        include: { _count: { select: { donations: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.donation.aggregate({
        where: {
          campaign: { creatorId },
          status: DonationStatus.COMPLETED,
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: { campaign: { creatorId }, status: DonationStatus.COMPLETED },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { title: true } },
          donor: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      this.getMonthlyRevenue(creatorId),
    ]);

    return {
      campaigns,
      totalRaised: donationAgg._sum.amount ?? 0,
      totalDonations: donationAgg._count.id,
      recentDonations,
      monthlyRevenue,
    };
  }

  async getDonorStats(donorId: string) {
    const [donationAgg, donations, supportedCampaigns] = await prisma.$transaction([
      prisma.donation.aggregate({
        where: { donorId, status: DonationStatus.COMPLETED },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: { donorId },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, slug: true, coverImageUrl: true, status: true } },
          reward: { select: { title: true } },
          payment: true,
        },
      }),
      prisma.campaign.count({
        where: { donations: { some: { donorId, status: DonationStatus.COMPLETED } } },
      }),
    ]);

    return {
      totalDonated: donationAgg._sum.amount ?? 0,
      totalDonations: donationAgg._count.id,
      supportedCampaigns,
      donations,
    };
  }

  private async getMonthlyRevenue(creatorId?: string) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const donations = await prisma.donation.findMany({
      where: {
        status: DonationStatus.COMPLETED,
        createdAt: { gte: twelveMonthsAgo },
        ...(creatorId && { campaign: { creatorId } }),
      },
      select: { amount: true, createdAt: true },
    });

    const monthly: Record<string, number> = {};
    donations.forEach(({ amount, createdAt }) => {
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] ?? 0) + Number(amount);
    });

    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
  }
}

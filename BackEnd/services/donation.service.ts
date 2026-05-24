import { DonationRepository } from '../repositories/donation.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { CreateDonationDto, DonationQueryDto } from '../dtos/donation.dto';
import { ApiError } from '../types/errors';
import { buildPaginationMeta } from '../utils/response';
import { DonationStatus, PaymentStatus, CampaignStatus } from '@prisma/client';
import { prisma } from '../config/database';

export class DonationService {
  private repo = new DonationRepository();
  private campaignRepo = new CampaignRepository();

  async getAll(query: DonationQueryDto) {
    const { donations, total } = await this.repo.findAll(query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { donations: donations.map(this.formatDonation), meta };
  }

  async getById(id: string) {
    const donation = await this.repo.findById(id);
    if (!donation) throw ApiError.notFound('Donation');
    return this.formatDonation(donation);
  }

  async create(dto: CreateDonationDto, userId?: string) {
    const campaign = await this.campaignRepo.findById(dto.campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw ApiError.badRequest('Campaign is not accepting donations');
    }

    // Validate amount against campaign constraints
    if (campaign.minDonation && dto.amount < Number(campaign.minDonation)) {
      throw ApiError.badRequest(`Minimum donation is ${campaign.minDonation}`);
    }
    if (campaign.maxDonation && dto.amount > Number(campaign.maxDonation)) {
      throw ApiError.badRequest(`Maximum donation is ${campaign.maxDonation}`);
    }

    // Validate reward if selected
    if (dto.rewardId) {
      const reward = await prisma.reward.findFirst({
        where: { id: dto.rewardId, campaignId: dto.campaignId, deletedAt: null },
      });
      if (!reward) throw ApiError.notFound('Reward');
      if (!reward.isAvailable) throw ApiError.badRequest('Reward is not available');
      if (dto.amount < Number(reward.minimumAmount)) {
        throw ApiError.badRequest(`Minimum amount for this reward is ${reward.minimumAmount}`);
      }
      if (reward.maxClaims && reward.claimsCount >= reward.maxClaims) {
        throw ApiError.badRequest('Reward is fully claimed');
      }
    }

    let donorId: string | undefined;
    if (userId && !dto.isAnonymous) {
      const donor = await prisma.donor.findUnique({ where: { userId } });
      donorId = donor?.id;
    }

    // Run in transaction: create donation + payment + update stats
    const result = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({
        data: {
          campaignId: dto.campaignId,
          donorId: donorId ?? null,
          rewardId: dto.rewardId ?? null,
          amount: dto.amount,
          currency: dto.currency,
          isAnonymous: dto.isAnonymous,
          message: dto.message ?? null,
          status: DonationStatus.PENDING,
        },
      });

      // Simulate payment processing (replace with real gateway integration)
      const payment = await tx.payment.create({
        data: {
          donationId: donation.id,
          provider: dto.paymentProvider,
          amount: dto.amount,
          currency: dto.currency,
          status: PaymentStatus.PROCESSING,
          externalId: `ext_${Date.now()}`,
        },
      });

      // Simulate successful payment
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCEEDED },
      });

      await tx.donation.update({
        where: { id: donation.id },
        data: { status: DonationStatus.COMPLETED },
      });

      // Update campaign funding stats
      await tx.campaign.update({
        where: { id: dto.campaignId },
        data: {
          raisedAmount: { increment: dto.amount },
          donationsCount: { increment: 1 },
          donorsCount: donorId ? { increment: 1 } : undefined,
        },
      });

      // Update donor lifetime stats
      if (donorId) {
        await tx.donor.update({
          where: { id: donorId },
          data: {
            totalDonated: { increment: dto.amount },
            donationsCount: { increment: 1 },
          },
        });
      }

      // Update reward claim count
      if (dto.rewardId) {
        await tx.reward.update({
          where: { id: dto.rewardId },
          data: { claimsCount: { increment: 1 } },
        });
      }

      return donation;
    });

    return this.formatDonation(await this.repo.findById(result.id) as NonNullable<Awaited<ReturnType<DonationRepository['findById']>>>);
  }

  async getRecentDonations(campaignId: string) {
    return this.repo.getRecentDonations(campaignId);
  }

  async getStats(campaignId: string) {
    return this.repo.getCampaignDonationStats(campaignId);
  }

  private formatDonation(donation: Record<string, unknown>) {
    const d = donation as { amount: unknown; [key: string]: unknown };
    return { ...d, amount: Number(d.amount) };
  }
}

import { RewardRepository } from '../repositories/reward.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { CreateRewardDto, UpdateRewardDto } from '../dtos/entities.dto';
import { ApiError } from '../types/errors';

export class RewardService {
  private repo = new RewardRepository();
  private campaignRepo = new CampaignRepository();

  async getByCampaign(campaignId: string) {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');
    return this.repo.findByCampaign(campaignId);
  }

  async create(campaignId: string, dto: CreateRewardDto, userId: string, userRoles: string[]) {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');

    const isAdmin = userRoles.includes('ADMIN');
    const isOwner = campaign.creator.userId === userId;
    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized');

    return this.repo.create({
      title: dto.title,
      description: dto.description,
      minimumAmount: dto.minimumAmount,
      estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : null,
      maxClaims: dto.maxClaims ?? null,
      imageUrl: dto.imageUrl ?? null,
      campaign: { connect: { id: campaignId } },
    });
  }

  async update(id: string, dto: UpdateRewardDto, userId: string, userRoles: string[]) {
    const reward = await this.repo.findById(id);
    if (!reward) throw ApiError.notFound('Reward');

    const campaign = await this.campaignRepo.findById(reward.campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');

    const isAdmin = userRoles.includes('ADMIN');
    const isOwner = campaign.creator.userId === userId;
    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized');

    return this.repo.update(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.minimumAmount !== undefined && { minimumAmount: dto.minimumAmount }),
      ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
      ...(dto.maxClaims !== undefined && { maxClaims: dto.maxClaims }),
      ...(dto.estimatedDelivery !== undefined && { estimatedDelivery: new Date(dto.estimatedDelivery) }),
    });
  }

  async delete(id: string, userId: string, userRoles: string[]) {
    const reward = await this.repo.findById(id);
    if (!reward) throw ApiError.notFound('Reward');

    const campaign = await this.campaignRepo.findById(reward.campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');

    const isAdmin = userRoles.includes('ADMIN');
    const isOwner = campaign.creator.userId === userId;
    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized');

    await this.repo.softDelete(id);
  }
}

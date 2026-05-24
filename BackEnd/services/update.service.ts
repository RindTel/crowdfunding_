import { UpdateRepository } from '../repositories/update.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { CreateUpdateDto, UpdateUpdateDto } from '../dtos/entities.dto';
import { ApiError } from '../types/errors';

export class CampaignUpdateService {
  private repo = new UpdateRepository();
  private campaignRepo = new CampaignRepository();

  async getByCampaign(campaignId: string) {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');
    return this.repo.findByCampaign(campaignId);
  }

  async create(campaignId: string, dto: CreateUpdateDto, userId: string, userRoles: string[]) {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');

    const isAdmin = userRoles.includes('ADMIN');
    const isOwner = campaign.creator.userId === userId;
    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized');

    return this.repo.create({
      title: dto.title,
      content: dto.content,
      imageUrl: dto.imageUrl ?? null,
      campaign: { connect: { id: campaignId } },
    });
  }

  async update(id: string, dto: UpdateUpdateDto, userId: string, userRoles: string[]) {
    const update = await this.repo.findById(id);
    if (!update) throw ApiError.notFound('Update');

    const campaign = await this.campaignRepo.findById(update.campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');

    const isAdmin = userRoles.includes('ADMIN');
    const isOwner = campaign.creator.userId === userId;
    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized');

    return this.repo.update(id, dto);
  }

  async delete(id: string, userId: string, userRoles: string[]) {
    const update = await this.repo.findById(id);
    if (!update) throw ApiError.notFound('Update');

    const campaign = await this.campaignRepo.findById(update.campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');

    const isAdmin = userRoles.includes('ADMIN');
    const isOwner = campaign.creator.userId === userId;
    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized');

    await this.repo.softDelete(id);
  }
}

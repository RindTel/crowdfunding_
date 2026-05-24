import { CommentRepository } from '../repositories/comment.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { CreateCommentDto } from '../dtos/entities.dto';
import { ApiError } from '../types/errors';
import { buildPaginationMeta } from '../utils/response';

export class CommentService {
  private repo = new CommentRepository();
  private campaignRepo = new CampaignRepository();

  async getByCampaign(campaignId: string, page: number, limit: number) {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');

    const { comments, total } = await this.repo.findByCampaign(campaignId, page, limit);
    return { comments, meta: buildPaginationMeta(total, page, limit) };
  }

  async create(campaignId: string, dto: CreateCommentDto, userId: string) {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw ApiError.notFound('Campaign');

    if (dto.parentId) {
      const parent = await this.repo.findById(dto.parentId);
      if (!parent || parent.campaignId !== campaignId) throw ApiError.notFound('Parent comment');
    }

    return this.repo.create({
      content: dto.content,
      campaign: { connect: { id: campaignId } },
      user: { connect: { id: userId } },
      ...(dto.parentId && { parent: { connect: { id: dto.parentId } } }),
    });
  }

  async delete(id: string, userId: string, userRoles: string[]) {
    const comment = await this.repo.findById(id);
    if (!comment) throw ApiError.notFound('Comment');

    const isAdmin = userRoles.includes('ADMIN');
    const isOwner = comment.userId === userId;
    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized');

    await this.repo.softDelete(id);
  }

  async like(id: string) {
    const comment = await this.repo.findById(id);
    if (!comment) throw ApiError.notFound('Comment');
    return this.repo.incrementLikes(id);
  }
}

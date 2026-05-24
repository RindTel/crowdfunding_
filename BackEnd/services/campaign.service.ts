import { CampaignRepository } from '../repositories/campaign.repository';
import { CreateCampaignDto, UpdateCampaignDto, CampaignQueryDto } from '../dtos/campaign.dto';
import { ApiError } from '../types/errors';
import { buildPaginationMeta } from '../utils/response';
import { slugify } from '../utils/slug';
import { CampaignStatus, RoleName } from '@prisma/client';
import { prisma } from '../config/database';

export class CampaignService {
  private repo = new CampaignRepository();

  async getAll(query: CampaignQueryDto) {
    const { campaigns, total } = await this.repo.findAll(query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { campaigns: campaigns.map(this.formatCampaign), meta };
  }

  async getById(id: string) {
    const campaign = await this.repo.findById(id);
    if (!campaign) throw ApiError.notFound('Campaign');
    await this.repo.incrementViews(id);
    return this.formatCampaign(campaign);
  }

  async getBySlug(slug: string) {
    const campaign = await this.repo.findBySlug(slug);
    if (!campaign) throw ApiError.notFound('Campaign');
    await this.repo.incrementViews(campaign.id);
    return this.formatCampaign(campaign);
  }

  async create(dto: CreateCampaignDto, userId: string) {
    const creator = await prisma.creator.findUnique({ where: { userId } });
    if (!creator) throw ApiError.forbidden('Only creators can create campaigns');

    // Generate unique slug
    let slug = slugify(dto.title);
    let attempt = 0;
    while (await this.repo.slugExists(slug)) {
      attempt++;
      slug = `${slugify(dto.title)}-${attempt}`;
    }

    const campaign = await this.repo.create({
      title: dto.title,
      slug,
      description: dto.description,
      story: dto.story,
      goalAmount: dto.goalAmount,
      currency: dto.currency,
      coverImageUrl: dto.coverImageUrl,
      videoUrl: dto.videoUrl,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      allowAnonymous: dto.allowAnonymous,
      minDonation: dto.minDonation,
      maxDonation: dto.maxDonation,
      creator: { connect: { id: creator.id } },
      category: { connect: { id: dto.categoryId } },
    });

    return this.formatCampaign(campaign);
  }

  async update(id: string, dto: UpdateCampaignDto, userId: string, userRoles: string[]) {
    const campaign = await this.repo.findById(id);
    if (!campaign) throw ApiError.notFound('Campaign');

    const isAdmin = userRoles.includes(RoleName.ADMIN);
    const isOwner = campaign.creator.userId === userId;

    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized to update this campaign');

    // Non-admins cannot directly set status to ACTIVE
    if (!isAdmin && dto.status === CampaignStatus.ACTIVE) {
      throw ApiError.forbidden('Campaigns must be reviewed before activation');
    }

    const updated = await this.repo.update(id, {
      ...(dto.title && { title: dto.title }),
      ...(dto.description && { description: dto.description }),
      ...(dto.story && { story: dto.story }),
      ...(dto.goalAmount !== undefined && { goalAmount: dto.goalAmount }),
      ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
      ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
      ...(dto.startDate && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      ...(dto.allowAnonymous !== undefined && { allowAnonymous: dto.allowAnonymous }),
      ...(dto.status && { status: dto.status }),
      ...(dto.categoryId && { category: { connect: { id: dto.categoryId } } }),
    });

    return this.formatCampaign(updated);
  }

  async delete(id: string, userId: string, userRoles: string[]) {
    const campaign = await this.repo.findById(id);
    if (!campaign) throw ApiError.notFound('Campaign');

    const isAdmin = userRoles.includes(RoleName.ADMIN);
    const isOwner = campaign.creator.userId === userId;
    if (!isAdmin && !isOwner) throw ApiError.forbidden('Not authorized');

    await this.repo.softDelete(id);
  }

  private formatCampaign(campaign: Record<string, unknown>) {
    const c = campaign as {
      goalAmount: unknown;
      raisedAmount: unknown;
      minDonation: unknown;
      maxDonation: unknown;
      [key: string]: unknown;
    };
    const goal = Number(c.goalAmount);
    const raised = Number(c.raisedAmount);
    return {
      ...c,
      goalAmount: goal,
      raisedAmount: raised,
      minDonation: c.minDonation ? Number(c.minDonation) : null,
      maxDonation: c.maxDonation ? Number(c.maxDonation) : null,
      progressPercent: goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0,
    };
  }
}

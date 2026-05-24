import { z } from 'zod';
import { CampaignStatus } from '@prisma/client';

export const createCampaignDto = z.object({
  title: z.string().min(5).max(200),
  categoryId: z.string().uuid(),
  description: z.string().min(20).max(500),
  story: z.string().min(100),
  goalAmount: z.number().positive().multipleOf(0.01),
  currency: z.string().length(3).default('USD'),
  coverImageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  allowAnonymous: z.boolean().default(true),
  minDonation: z.number().positive().optional(),
  maxDonation: z.number().positive().optional(),
});

export const updateCampaignDto = createCampaignDto.partial().extend({
  status: z.nativeEnum(CampaignStatus).optional(),
});

export const campaignQueryDto = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('12'),
  status: z.nativeEnum(CampaignStatus).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  creatorId: z.string().uuid().optional(),
  isFeatured: z.string().transform(v => v === 'true').optional(),
  sortBy: z.enum(['createdAt', 'raisedAmount', 'donorsCount', 'endDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCampaignDto = z.infer<typeof createCampaignDto>;
export type UpdateCampaignDto = z.infer<typeof updateCampaignDto>;
export type CampaignQueryDto = z.infer<typeof campaignQueryDto>;

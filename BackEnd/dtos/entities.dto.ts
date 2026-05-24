import { z } from 'zod';

// ── Reward DTOs ───────────────────────────────
export const createRewardDto = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  minimumAmount: z.number().positive(),
  estimatedDelivery: z.string().datetime().optional(),
  maxClaims: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
});

export const updateRewardDto = createRewardDto.partial().extend({
  isAvailable: z.boolean().optional(),
});

export type CreateRewardDto = z.infer<typeof createRewardDto>;
export type UpdateRewardDto = z.infer<typeof updateRewardDto>;

// ── Comment DTOs ──────────────────────────────
export const createCommentDto = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

export const commentQueryDto = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type CreateCommentDto = z.infer<typeof createCommentDto>;

// ── Update DTOs ───────────────────────────────
export const createUpdateDto = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  imageUrl: z.string().url().optional(),
});

export const updateUpdateDto = createUpdateDto.partial();
export type CreateUpdateDto = z.infer<typeof createUpdateDto>;
export type UpdateUpdateDto = z.infer<typeof updateUpdateDto>;

// ── Category DTOs ─────────────────────────────
export const createCategoryDto = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  iconUrl: z.string().url().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;

// ── User query DTO ────────────────────────────
export const userQueryDto = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'CREATOR', 'DONOR']).optional(),
});

export type UserQueryDto = z.infer<typeof userQueryDto>;

// ── Report DTO ────────────────────────────────
export const createReportDto = z.object({
  campaignId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  reason: z.enum(['SPAM', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'MISLEADING', 'COPYRIGHT', 'OTHER']),
  description: z.string().max(1000).optional(),
}).refine(d => d.campaignId || d.commentId, {
  message: 'Must report either a campaign or a comment',
});

export type CreateReportDto = z.infer<typeof createReportDto>;

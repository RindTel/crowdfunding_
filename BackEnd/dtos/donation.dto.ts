import { z } from 'zod';

export const createDonationDto = z.object({
  campaignId: z.string().uuid(),
  rewardId: z.string().uuid().optional(),
  amount: z.number().positive().multipleOf(0.01),
  currency: z.string().length(3).default('USD'),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500).optional(),
  paymentProvider: z.string().default('stripe'),
});

export const donationQueryDto = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  campaignId: z.string().uuid().optional(),
  donorId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateDonationDto = z.infer<typeof createDonationDto>;
export type DonationQueryDto = z.infer<typeof donationQueryDto>;

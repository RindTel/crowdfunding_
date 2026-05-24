import { Response, NextFunction } from 'express';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { ResponseBuilder } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { ApiError } from '../types/errors';

const repo = new AnalyticsRepository();

export const AnalyticsController = {
  async adminStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await repo.getAdminStats();
      return ResponseBuilder.success(res, stats);
    } catch (err) { next(err); }
  },

  async creatorStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Admin can pass ?creatorId=xxx, otherwise use own profile
      const userId = req.user!.sub;
      const creator = await prisma.creator.findUnique({ where: { userId } });
      if (!creator) {
        // Return empty stats instead of 500
        return ResponseBuilder.success(res, {
          campaigns: [], totalRaised: 0, totalDonations: 0,
          recentDonations: [], monthlyRevenue: []
        });
      }
      const stats = await repo.getCreatorStats(creator.id);
      return ResponseBuilder.success(res, stats);
    } catch (err) { next(err); }
  },

  async donorStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const donor = await prisma.donor.findUnique({ where: { userId: req.user!.sub } });
      if (!donor) throw ApiError.notFound('Donor profile');
      const stats = await repo.getDonorStats(donor.id);
      return ResponseBuilder.success(res, stats);
    } catch (err) { next(err); }
  },
};

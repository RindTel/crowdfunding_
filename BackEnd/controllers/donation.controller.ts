import { Response, NextFunction } from 'express';
import { DonationService } from '../services/donation.service';
import { ResponseBuilder } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const service = new DonationService();

export const DonationController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { donations, meta } = await service.getAll(req.query as never);
      return ResponseBuilder.paginated(res, donations, meta);
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const donation = await service.getById(req.params.id);
      return ResponseBuilder.success(res, donation);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const donation = await service.create(req.body, req.user?.sub);
      return ResponseBuilder.created(res, donation, 'Donation successful');
    } catch (err) { next(err); }
  },

  async getRecentDonations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const donations = await service.getRecentDonations(req.params.campaignId);
      return ResponseBuilder.success(res, donations);
    } catch (err) { next(err); }
  },
};

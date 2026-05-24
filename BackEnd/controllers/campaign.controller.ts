import { Response, NextFunction } from 'express';
import { CampaignService } from '../services/campaign.service';
import { ResponseBuilder } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const service = new CampaignService();

export const CampaignController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { campaigns, meta } = await service.getAll(req.query as never);
      return ResponseBuilder.paginated(res, campaigns, meta);
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await service.getById(req.params.id);
      return ResponseBuilder.success(res, campaign);
    } catch (err) { next(err); }
  },

  async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await service.getBySlug(req.params.slug);
      return ResponseBuilder.success(res, campaign);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await service.create(req.body, req.user!.sub);
      return ResponseBuilder.created(res, campaign, 'Campaign created successfully');
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await service.update(req.params.id, req.body, req.user!.sub, req.user!.roles);
      return ResponseBuilder.success(res, campaign, 'Campaign updated');
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await service.delete(req.params.id, req.user!.sub, req.user!.roles);
      return ResponseBuilder.noContent(res);
    } catch (err) { next(err); }
  },
};

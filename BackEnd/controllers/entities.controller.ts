import { Response, NextFunction } from 'express';
import { RewardService } from '../services/reward.service';
import { CommentService } from '../services/comment.service';
import { CampaignUpdateService } from '../services/update.service';
import { UserService } from '../services/user.service';
import { ReportService } from '../services/report.service';
import { CategoryRepository } from '../repositories/category.repository';
import { ResponseBuilder, buildPaginationMeta } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { slugify } from '../utils/slug';

// ── Reward ────────────────────────────────────
const rewardSvc = new RewardService();

export const RewardController = {
  async getByCampaign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rewards = await rewardSvc.getByCampaign(req.params.campaignId);
      return ResponseBuilder.success(res, rewards);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reward = await rewardSvc.create(req.params.campaignId, req.body, req.user!.sub, req.user!.roles);
      return ResponseBuilder.created(res, reward, 'Reward created');
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reward = await rewardSvc.update(req.params.id, req.body, req.user!.sub, req.user!.roles);
      return ResponseBuilder.success(res, reward, 'Reward updated');
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await rewardSvc.delete(req.params.id, req.user!.sub, req.user!.roles);
      return ResponseBuilder.noContent(res);
    } catch (err) { next(err); }
  },
};

// ── Comment ───────────────────────────────────
const commentSvc = new CommentService();

export const CommentController = {
  async getByCampaign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { comments, meta } = await commentSvc.getByCampaign(req.params.campaignId, page, limit);
      return ResponseBuilder.paginated(res, comments, meta);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentSvc.create(req.params.campaignId, req.body, req.user!.sub);
      return ResponseBuilder.created(res, comment, 'Comment posted');
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await commentSvc.delete(req.params.id, req.user!.sub, req.user!.roles);
      return ResponseBuilder.noContent(res);
    } catch (err) { next(err); }
  },

  async like(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentSvc.like(req.params.id);
      return ResponseBuilder.success(res, comment);
    } catch (err) { next(err); }
  },
};

// ── Campaign Update ───────────────────────────
const updateSvc = new CampaignUpdateService();

export const UpdateController = {
  async getByCampaign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updates = await updateSvc.getByCampaign(req.params.campaignId);
      return ResponseBuilder.success(res, updates);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const update = await updateSvc.create(req.params.campaignId, req.body, req.user!.sub, req.user!.roles);
      return ResponseBuilder.created(res, update, 'Update posted');
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const update = await updateSvc.update(req.params.id, req.body, req.user!.sub, req.user!.roles);
      return ResponseBuilder.success(res, update);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await updateSvc.delete(req.params.id, req.user!.sub, req.user!.roles);
      return ResponseBuilder.noContent(res);
    } catch (err) { next(err); }
  },
};

// ── Category ──────────────────────────────────
const categoryRepo = new CategoryRepository();

export const CategoryController = {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await categoryRepo.findAll();
      return ResponseBuilder.success(res, categories);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.body.slug || slugify(req.body.name);
      const category = await categoryRepo.create({ ...req.body, slug });
      return ResponseBuilder.created(res, category, 'Category created');
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryRepo.update(req.params.id, req.body);
      return ResponseBuilder.success(res, category);
    } catch (err) { next(err); }
  },
};

// ── User (admin) ──────────────────────────────
const userSvc = new UserService();

export const UserController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { users, meta } = await userSvc.getAll(req.query as never);
      return ResponseBuilder.paginated(res, users, meta);
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userSvc.getById(req.params.id);
      return ResponseBuilder.success(res, user);
    } catch (err) { next(err); }
  },

  async setActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userSvc.setActive(req.params.id, req.body.isActive);
      return ResponseBuilder.success(res, user, `User ${req.body.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userSvc.delete(req.params.id, req.user!.sub);
      return ResponseBuilder.noContent(res);
    } catch (err) { next(err); }
  },
};

// ── Report ────────────────────────────────────
const reportSvc = new ReportService();

export const ReportController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const status = req.query.status as 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED' | undefined;
      const { reports, meta } = await reportSvc.getAll(page, limit, status);
      return ResponseBuilder.paginated(res, reports, meta);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportSvc.create(req.body, req.user!.sub);
      return ResponseBuilder.created(res, report, 'Report submitted');
    } catch (err) { next(err); }
  },

  async resolve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportSvc.resolve(req.params.id, req.user!.sub, req.body.status);
      return ResponseBuilder.success(res, report, 'Report resolved');
    } catch (err) { next(err); }
  },
};

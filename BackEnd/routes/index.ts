import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { CampaignController } from '../controllers/campaign.controller';
import { DonationController } from '../controllers/donation.controller';
import { AnalyticsController } from '../controllers/analytics.controller';
import {
  RewardController, CommentController, UpdateController,
  CategoryController, UserController, ReportController,
} from '../controllers/entities.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerDto, loginDto, refreshTokenDto } from '../dtos/auth.dto';
import { createCampaignDto, updateCampaignDto, campaignQueryDto } from '../dtos/campaign.dto';
import { createDonationDto, donationQueryDto } from '../dtos/donation.dto';
import {
  createRewardDto, updateRewardDto, createCommentDto, commentQueryDto,
  createUpdateDto, updateUpdateDto, createCategoryDto, userQueryDto, createReportDto,
} from '../dtos/entities.dto';

const router = Router();

// AUTH
router.post('/auth/register',   validate(registerDto),     AuthController.register);
router.post('/auth/login',      validate(loginDto),        AuthController.login);
router.post('/auth/refresh',    validate(refreshTokenDto), AuthController.refreshToken);
router.post('/auth/logout',     validate(refreshTokenDto), AuthController.logout);
router.get ('/auth/me',         authenticate,              AuthController.getProfile);

// CATEGORIES
router.get ('/categories',      CategoryController.getAll);
router.post('/categories',      authenticate, authorize('ADMIN'), validate(createCategoryDto), CategoryController.create);
router.patch('/categories/:id', authenticate, authorize('ADMIN'), CategoryController.update);

// CAMPAIGNS
router.get ('/campaigns',           validate(campaignQueryDto, 'query'), optionalAuth, CampaignController.getAll);
router.get ('/campaigns/slug/:slug', optionalAuth, CampaignController.getBySlug);
router.get ('/campaigns/:id',       optionalAuth, CampaignController.getById);
router.post('/campaigns',           authenticate, authorize('CREATOR', 'ADMIN'), validate(createCampaignDto), CampaignController.create);
router.patch('/campaigns/:id',      authenticate, validate(updateCampaignDto), CampaignController.update);
router.delete('/campaigns/:id',     authenticate, CampaignController.delete);

// Rewards
router.get ('/campaigns/:campaignId/rewards', RewardController.getByCampaign);
router.post('/campaigns/:campaignId/rewards', authenticate, authorize('CREATOR','ADMIN'), validate(createRewardDto), RewardController.create);
router.patch('/rewards/:id',  authenticate, validate(updateRewardDto), RewardController.update);
router.delete('/rewards/:id', authenticate, RewardController.delete);

// Comments
router.get ('/campaigns/:campaignId/comments', validate(commentQueryDto, 'query'), optionalAuth, CommentController.getByCampaign);
router.post('/campaigns/:campaignId/comments', authenticate, validate(createCommentDto), CommentController.create);
router.delete('/comments/:id',                 authenticate, CommentController.delete);
router.post ('/comments/:id/like',             authenticate, CommentController.like);

// Campaign Updates
router.get ('/campaigns/:campaignId/updates', UpdateController.getByCampaign);
router.post('/campaigns/:campaignId/updates', authenticate, authorize('CREATOR','ADMIN'), validate(createUpdateDto), UpdateController.create);
router.patch('/updates/:id',  authenticate, validate(updateUpdateDto), UpdateController.update);
router.delete('/updates/:id', authenticate, UpdateController.delete);

// Recent donations on campaign
router.get('/campaigns/:campaignId/donations/recent', DonationController.getRecentDonations);

// DONATIONS
router.get ('/donations',     authenticate, authorize('ADMIN'), validate(donationQueryDto, 'query'), DonationController.getAll);
router.get ('/donations/:id', authenticate, DonationController.getById);
router.post('/donations',     optionalAuth, validate(createDonationDto), DonationController.create);

// USERS (admin)
router.get   ('/users',             authenticate, authorize('ADMIN'), validate(userQueryDto, 'query'), UserController.getAll);
router.get   ('/users/:id',         authenticate, authorize('ADMIN'), UserController.getById);
router.patch ('/users/:id/status',  authenticate, authorize('ADMIN'), UserController.setActive);
router.delete('/users/:id',         authenticate, authorize('ADMIN'), UserController.delete);

// REPORTS
router.get   ('/reports',              authenticate, authorize('ADMIN'), ReportController.getAll);
router.post  ('/reports',             authenticate, validate(createReportDto), ReportController.create);
router.patch ('/reports/:id/resolve', authenticate, authorize('ADMIN'), ReportController.resolve);

// ANALYTICS
router.get('/analytics/admin',   authenticate, authorize('ADMIN'),            AnalyticsController.adminStats);
router.get('/analytics/creator', authenticate, authorize('CREATOR', 'ADMIN'), AnalyticsController.creatorStats);
router.get('/analytics/donor',   authenticate, authorize('DONOR'),            AnalyticsController.donorStats);

export default router;

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseBuilder } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const service = new AuthService();

export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.register(req.body);
      return ResponseBuilder.created(res, result, 'Registration successful');
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.login(req.body);
      return ResponseBuilder.success(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await service.refreshTokens(req.body.refreshToken);
      return ResponseBuilder.success(res, tokens, 'Tokens refreshed');
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await service.logout(req.body.refreshToken);
      return ResponseBuilder.noContent(res);
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await service.getProfile(req.user!.sub);
      return ResponseBuilder.success(res, profile);
    } catch (err) {
      next(err);
    }
  },
};

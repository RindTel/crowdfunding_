import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { generateTokenPair, verifyRefreshToken, signRefreshToken } from '../utils/jwt';
import { ApiError } from '../types/errors';
import { RoleName } from '@prisma/client';
import { prisma } from '../config/database';

export class AuthService {
  private repo = new AuthRepository();

  async register(dto: RegisterDto) {
    const existing = await this.repo.findUserByEmail(dto.email);
    if (existing) throw ApiError.conflict('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, config.BCRYPT_SALT_ROUNDS);

    const user = await this.repo.createUser({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // Assign DONOR role always + optional CREATOR
    await this.repo.assignRole(user.id, RoleName.DONOR);
    if (dto.role === 'CREATOR') {
      await this.repo.assignRole(user.id, RoleName.CREATOR);
      await prisma.creator.create({ data: { userId: user.id } });
    } else {
      await prisma.donor.create({ data: { userId: user.id } });
    }

    const roles = [RoleName.DONOR, ...(dto.role === 'CREATOR' ? [RoleName.CREATOR] : [])];
    const tokens = generateTokenPair({ sub: user.id, email: user.email, roles });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.repo.createRefreshToken(user.id, tokens.refreshToken, expiresAt);

    return {
      user: this.sanitizeUser(user, roles),
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Invalid credentials');

    const roles = user.userRoles.map((ur) => ur.role.name);
    const tokens = generateTokenPair({ sub: user.id, email: user.email, roles });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.repo.createRefreshToken(user.id, tokens.refreshToken, expiresAt);

    return {
      user: this.sanitizeUser(user, roles),
      tokens,
    };
  }

  async refreshTokens(oldToken: string) {
    const record = await this.repo.findRefreshToken(oldToken);

    if (!record || record.isRevoked || new Date() > record.expiresAt) {
      // Token reuse detected — revoke all
      if (record) await this.repo.revokeAllUserTokens(record.userId);
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const roles = record.user.userRoles.map((ur) => ur.role.name);
    const newTokens = generateTokenPair({
      sub: record.user.id,
      email: record.user.email,
      roles,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.repo.revokeRefreshToken(oldToken, newTokens.refreshToken);
    await this.repo.createRefreshToken(record.user.id, newTokens.refreshToken, expiresAt);

    return newTokens;
  }

  async logout(refreshToken: string) {
    const record = await this.repo.findRefreshToken(refreshToken);
    if (record && !record.isRevoked) {
      await this.repo.revokeRefreshToken(refreshToken);
    }
  }

  async getProfile(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw ApiError.notFound('User');
    const roles = user.userRoles.map((ur) => ur.role.name);
    return this.sanitizeUser(user, roles);
  }

  private sanitizeUser(user: { id: string; email: string; firstName: string; lastName: string; avatarUrl: string | null; isVerified: boolean; createdAt: Date }, roles: string[]) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      roles,
      createdAt: user.createdAt,
    };
  }
}

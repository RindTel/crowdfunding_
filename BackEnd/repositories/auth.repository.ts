import { prisma } from '../config/database';
import { RoleName } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: { include: { role: true } },
      },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }) {
    return prisma.user.create({
      data,
      include: {
        userRoles: { include: { role: true } },
      },
    });
  }

  async assignRole(userId: string, roleName: RoleName) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);
    return prisma.userRole.create({ data: { userId, roleId: role.id } });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { userRoles: { include: { role: true } } } } },
    });
  }

  async revokeRefreshToken(token: string, replacedBy?: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true, replacedBy },
    });
  }

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}

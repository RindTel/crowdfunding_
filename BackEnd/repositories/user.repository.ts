import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findAll(params: { page: number; limit: number; search?: string; role?: string }) {
    const { page, limit, search, role } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { userRoles: { some: { role: { name: role as 'ADMIN' | 'CREATOR' | 'DONOR' } } } }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          avatarUrl: true, isActive: true, isVerified: true, createdAt: true,
          userRoles: { include: { role: { select: { name: true } } } },
          _count: { select: { creator: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: { include: { role: true } },
        creator: true,
        donor: true,
      },
    });
  }

  async setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  }

  async softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }
}

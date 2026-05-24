import { prisma } from '../config/database';

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { campaigns: true } } },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  }

  async create(data: { name: string; slug: string; description?: string; iconUrl?: string }) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; description: string; isActive: boolean }>) {
    return prisma.category.update({ where: { id }, data });
  }
}

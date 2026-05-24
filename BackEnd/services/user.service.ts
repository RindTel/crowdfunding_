import { UserRepository } from '../repositories/user.repository';
import { UserQueryDto } from '../dtos/entities.dto';
import { ApiError } from '../types/errors';
import { buildPaginationMeta } from '../utils/response';

export class UserService {
  private repo = new UserRepository();

  async getAll(query: UserQueryDto) {
    const { users, total } = await this.repo.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role,
    });

    const formatted = users.map(u => ({
      ...u,
      roles: u.userRoles.map((ur: { role: { name: string } }) => ur.role.name),
    }));

    return { users: formatted, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async getById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw ApiError.notFound('User');
    return {
      ...user,
      roles: user.userRoles.map(ur => ur.role.name),
      passwordHash: undefined,
    };
  }

  async setActive(id: string, isActive: boolean) {
    const user = await this.repo.findById(id);
    if (!user) throw ApiError.notFound('User');
    return this.repo.setActive(id, isActive);
  }

  async delete(id: string, requesterId: string) {
    if (id === requesterId) throw ApiError.badRequest('Cannot delete your own account');
    const user = await this.repo.findById(id);
    if (!user) throw ApiError.notFound('User');
    await this.repo.softDelete(id);
  }
}

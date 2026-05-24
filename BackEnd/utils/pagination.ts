import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export function getPaginationParams(query: PaginationQuery) {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

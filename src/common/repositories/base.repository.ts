import { ObjectLiteral, Repository } from 'typeorm';
import { PaginatedResult } from '../types/paginated-result.type';

export class BaseRepository<T extends ObjectLiteral> {
  constructor(protected repository: Repository<T>) {}

  async findWithPagination(
    where: { [key: string]: any },
    options: { limit: number; cursor?: string },
  ): Promise<PaginatedResult<T>> {
    const queryBuilder = this.repository.createQueryBuilder('entity');

    // Build WHERE clause dynamically from the where object
    const whereConditions: string[] = [];
    const params: { [key: string]: any } = {};

    Object.entries(where).forEach(([key, value]) => {
      whereConditions.push(`entity.${key} = :${key}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      params[key] = value;
    });

    if (whereConditions.length > 0) {
      queryBuilder.where(whereConditions.join(' AND '), params);
    }

    // Apply cursor for pagination
    if (options.cursor) {
      queryBuilder.andWhere('entity.id > :cursor', { cursor: parseInt(options.cursor, 10) });
    }

    const items = await queryBuilder
      .orderBy('entity.id', 'ASC')
      .limit(options.limit + 1)
      .getMany();

    const hasMore = items.length > options.limit;
    const paginatedItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore
      ? String(paginatedItems[paginatedItems.length - 1]['id'])
      : undefined;

    return {
      items: paginatedItems,
      cursor: nextCursor,
      hasMore,
      count: paginatedItems.length,
    };
  }
}

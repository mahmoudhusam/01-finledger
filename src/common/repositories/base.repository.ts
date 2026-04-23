import { Repository } from 'typeorm';
import { PaginatedResult } from '../types/paginated-result.type';

export class BaseRepository<T> {
  constructor(protected repository: Repository<T>) {}

  async findWithPagination(limit: number, cursor?: string): Promise<PaginatedResult<T>> {
    const queryBuilder = this.repository.createQueryBuilder('entity');

    if (cursor) {
      queryBuilder.where('entity.id > :cursor', { cursor: parseInt(cursor, 10) });
    }

    const items = await queryBuilder
      .orderBy('entity.id', 'ASC')
      .limit(limit + 1)
      .getMany();

    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? String(paginatedItems[paginatedItems.length - 1].id) : undefined;

    return {
      items: paginatedItems,
      cursor: nextCursor,
      hasMore,
      count: paginatedItems.length,
    };
  }
}

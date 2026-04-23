export type PaginatedResult<T> = {
  items: T[];
  cursor?: string;
  hasMore: boolean;
  count: number;
};

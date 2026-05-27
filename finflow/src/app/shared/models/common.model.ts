export interface PagedResult<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

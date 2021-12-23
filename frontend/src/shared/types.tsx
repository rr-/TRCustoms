const DISABLE_PAGING = Symbol("DISABLE_PAGING");

interface GenericQuery {
  page?: number | null | typeof DISABLE_PAGING;
  sort?: string | null;
  search?: string | null;
}

interface PagedResponse<T> {
  current_page: number;
  last_page: number;
  total_count: number;
  items_on_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
  disable_paging: boolean;
}

export type { PagedResponse, GenericQuery };
export { DISABLE_PAGING };

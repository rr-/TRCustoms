const DISABLE_PAGING = Symbol("DISABLE_PAGING");

interface IGenericQuery {
  page: number | null | typeof DISABLE_PAGING;
  sort: string | null;
  search: string | null;
}

interface IPagedResponse<T> {
  current_page: number;
  last_page: number;
  total_count: number;
  items_on_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
  disable_paging: boolean;
}

export type { IPagedResponse, IGenericQuery };
export { DISABLE_PAGING };

interface IGenericQuery {
  page: number | null;
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
}

export type { IPagedResponse, IGenericQuery };

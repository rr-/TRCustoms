import { DISABLE_PAGING } from "src/shared/constants";

interface PagedResponse<TItem> {
  current_page: number;
  last_page: number;
  total_count: number;
  items_on_page: number;
  next: string | null;
  previous: string | null;
  results: TItem[];
  disable_paging: boolean;
}

interface GenericSearchQuery {
  page?: number | null | typeof DISABLE_PAGING;
  sort?: string | null;
  search?: string | null;
}

interface GenericSearchResult<TSearchQuery, TItem>
  extends PagedResponse<TItem> {
  searchQuery: TSearchQuery;
}

interface RatingClass {
  id: number;
  name: string;
  position: number;
}

enum DisplayMode {
  Cover = "cover",
  Contain = "contain",
}

export type {
  PagedResponse,
  GenericSearchQuery,
  GenericSearchResult,
  RatingClass,
};
export { DisplayMode };

import { useInfiniteQuery } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRef } from "react";
import { DISABLE_PAGING } from "src/constants";
import type { Key } from "src/services/queryKeys";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { useInfiniteScroll } from "src/utils/useInfiniteScroll";

// The paged and infinite fetch engines shared by DataList and DataTable. Both
// widgets used to inline near-identical copies of these; keeping them here is
// the single source of the search-fetch behaviour (query key, paging, count
// reporting, infinite-scroll wiring).

type SearchFunc<TItem, TQuery> = (
  searchQuery: TQuery,
) => Promise<GenericSearchResult<TQuery, TItem>>;

const useReportCount = (
  totalCount: number | undefined,
  onResultCountChange?: ((count: number) => void) | undefined,
): void => {
  // Report from an effect, not render: onResultCountChange is usually a
  // parent's state setter, and calling it during render updates another
  // component mid-render.
  useEffect(() => {
    if (totalCount !== undefined) {
      onResultCountChange?.(totalCount);
    }
  }, [onResultCountChange, totalCount]);
};

const usePagedSearch = <TItem, TQuery extends GenericSearchQuery>(
  queryKey: Key,
  searchQuery: TQuery,
  searchFunc: SearchFunc<TItem, TQuery>,
  onResultCountChange?: ((count: number) => void) | undefined,
) => {
  const result = useQuery<GenericSearchResult<TQuery, TItem> | null, Error>({
    queryKey: [...queryKey, searchQuery],
    queryFn: async () => searchFunc(searchQuery),
  });
  useReportCount(result.data?.total_count, onResultCountChange);
  return result;
};

const useInfiniteSearch = <TItem, TQuery extends GenericSearchQuery>(
  queryKey: Key,
  searchQuery: TQuery,
  searchFunc: SearchFunc<TItem, TQuery>,
  onResultCountChange?: ((count: number) => void) | undefined,
) => {
  const result = useInfiniteQuery<GenericSearchResult<TQuery, TItem>, Error>({
    queryKey: [...queryKey, searchQuery],
    queryFn: async ({ pageParam }) =>
      searchFunc({
        ...searchQuery,
        page:
          searchQuery.page === DISABLE_PAGING
            ? DISABLE_PAGING
            : (pageParam as number),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.disable_paging) {
        return undefined;
      }
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },
    refetchOnWindowFocus: false,
  });

  const scrollRef = useRef<HTMLSpanElement>(null);
  // Re-observe when pagination state changes (new page / exhausted), not on
  // every render — result is a fresh object each render.
  useInfiniteScroll(
    { element: scrollRef, fetch: () => result.fetchNextPage() },
    [result.hasNextPage, result.data?.pages?.length],
  );

  useReportCount(result.data?.pages?.[0]?.total_count, onResultCountChange);
  return { result, scrollRef };
};

export { usePagedSearch, useInfiniteSearch };

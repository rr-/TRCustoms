import styles from "./index.module.css";
import { useRef } from "react";
import { Fragment } from "react";
import { useEffect } from "react";
import { useInfiniteQuery } from "react-query";
import { useQuery } from "react-query";
import { Loader } from "src/components/common/Loader";
import { Pager } from "src/components/common/Pager";
import { DISABLE_PAGING } from "src/constants";
import { useInfiniteScroll } from "src/contexts/InfiniteScroll";
import { useSettings } from "src/contexts/SettingsContext";
import type { GenericSearchResult } from "src/types";
import type { GenericSearchQuery } from "src/types";

const DefaultNoItemsElement = <p>There are no results to show.</p>;

interface DataListProps<TItem, TQuery> {
  className?: string | undefined;
  queryName: string;
  itemKey: (item: TItem) => string;
  itemView: (item: TItem) => React.ReactNode;
  pageView?: (children: React.ReactNode) => React.ReactNode;
  noItemsElement?: React.ReactNode;

  searchQuery: TQuery;
  searchFunc: (
    searchQuery: TQuery,
  ) => Promise<GenericSearchResult<TQuery, TItem>>;

  onResultCountChange?: ((count: number) => void) | undefined;
  onSearchQueryChange?: ((searchQuery: TQuery) => void) | undefined;
}

interface ConcreteDataListProps<TItem, TQuery>
  extends DataListProps<TItem, TQuery> {
  pageView: (children: React.ReactNode) => React.ReactNode;
}

const PagedDataList = <TItem extends {}, TQuery extends GenericSearchQuery>({
  className,
  searchQuery,
  searchFunc,
  onResultCountChange,
  onSearchQueryChange,
  itemKey,
  itemView,
  pageView,
  queryName,
  noItemsElement,
}: ConcreteDataListProps<TItem, TQuery>) => {
  const result = useQuery<GenericSearchResult<TQuery, TItem>, Error>(
    [queryName, searchFunc, searchQuery],
    async () => searchFunc(searchQuery),
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  if (result.data.total_count !== undefined) {
    onResultCountChange?.(result.data.total_count);
  }

  return (
    <div className={`ChildMarginClear ${className || ""}`}>
      {result.data.results.length
        ? pageView(
            result.data.results.map((item) => (
              <Fragment key={itemKey(item)}>{itemView(item)}</Fragment>
            )),
          )
        : noItemsElement || DefaultNoItemsElement}

      {onSearchQueryChange &&
      result.data?.results?.length &&
      !result.data.disable_paging ? (
        <Pager
          onPageChange={(page) =>
            onSearchQueryChange({ ...searchQuery, page: page })
          }
          pagedResponse={result.data}
        />
      ) : null}
    </div>
  );
};

const InfiniteDataList = <TItem extends {}, TQuery extends GenericSearchQuery>({
  className,
  searchQuery,
  searchFunc,
  onResultCountChange,
  itemKey,
  itemView,
  pageView,
  queryName,
  noItemsElement,
}: ConcreteDataListProps<TItem, TQuery>) => {
  const result = useInfiniteQuery<GenericSearchResult<TQuery, TItem>, Error>(
    [queryName, searchQuery],
    async ({ pageParam }) => {
      return searchFunc({
        ...searchQuery,
        page:
          searchQuery.page === DISABLE_PAGING
            ? DISABLE_PAGING
            : pageParam === undefined
              ? 1
              : pageParam,
      });
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage) {
          return undefined;
        }
        if (lastPage.disable_paging) {
          return undefined;
        }
        return lastPage.current_page < lastPage.last_page
          ? lastPage.current_page + 1
          : undefined;
      },
      refetchOnWindowFocus: false,
    },
  );

  const infiniteScrollRef = useRef(null);
  useInfiniteScroll(
    { element: infiniteScrollRef, fetch: () => result.fetchNextPage() },
    [result],
  );

  useEffect(() => {
    if (result.data?.pages?.[0]?.total_count !== undefined) {
      onResultCountChange?.(result.data?.pages?.[0].total_count);
    }
  }, [onResultCountChange, result]);

  return (
    <div className={`ChildMarginClear ${className}`}>
      {result.data?.pages?.[0]?.total_count === 0 &&
        (noItemsElement || DefaultNoItemsElement)}

      {pageView(
        result.data?.pages?.map((result, i) => (
          <div key={`body${i}`} className={styles.page}>
            {result.results.map((item) => (
              <Fragment key={itemKey(item)}>{itemView(item)}</Fragment>
            ))}
          </div>
        )),
      )}

      <span ref={infiniteScrollRef} />

      {(result.isFetching || result.isFetchingNextPage) && <Loader />}
    </div>
  );
};

const DataList = <TItem extends {}, TQuery extends GenericSearchQuery>({
  pageView,
  ...props
}: DataListProps<TItem, TQuery>) => {
  const { infiniteScroll } = useSettings();
  pageView ||= (children) => <div>{children}</div>;

  if (infiniteScroll) {
    return <InfiniteDataList pageView={pageView} {...props} />;
  }
  return <PagedDataList pageView={pageView} {...props} />;
};

export { PagedDataList, InfiniteDataList, DataList };

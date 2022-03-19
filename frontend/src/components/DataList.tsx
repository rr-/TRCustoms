import "./DataList.css";
import { useRef } from "react";
import { Fragment } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useInfiniteQuery } from "react-query";
import { useQuery } from "react-query";
import { useInfiniteScroll } from "src/components/DataTable";
import { Loader } from "src/components/Loader";
import { Pager } from "src/components/Pager";
import { DISABLE_PAGING } from "src/constants";
import type { GenericSearchResult } from "src/types";
import type { GenericSearchQuery } from "src/types";

interface DataListProps<TItem, TQuery> {
  className?: string | undefined;
  queryName: string;
  itemKey: (item: TItem) => string;
  itemView: (item: TItem) => React.ReactNode;

  searchQuery: TQuery;
  searchFunc: (
    searchQuery: TQuery
  ) => Promise<GenericSearchResult<TQuery, TItem>>;

  onResultCountChange?: ((count: number) => void) | undefined;
  onSearchQueryChange?: ((searchQuery: TQuery) => void) | undefined;
}

const PagedDataList = <TItem extends {}, TQuery extends GenericSearchQuery>({
  className,
  searchQuery,
  searchFunc,
  onResultCountChange,
  onSearchQueryChange,
  itemKey,
  itemView,
  queryName,
}: DataListProps<TItem, TQuery>) => {
  const result = useQuery<GenericSearchResult<TQuery, TItem>, Error>(
    [queryName, searchFunc, searchQuery],
    async () => searchFunc(searchQuery)
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
    <div className={`DataList ${className || ""}`}>
      {result.data.results.length ? (
        result.data.results.map((item) => (
          <Fragment key={itemKey(item)}>{itemView(item)}</Fragment>
        ))
      ) : (
        <p>There are no results to show.</p>
      )}

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
  onSearchQueryChange,
  itemKey,
  itemView,
  queryName,
}: DataListProps<TItem, TQuery>) => {
  const [loadingElement, setLoadingElement] = useState<any>(null);

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
    }
  );

  if (result.data?.pages?.[0]?.total_count !== undefined) {
    onResultCountChange?.(result.data?.pages?.[0].total_count);
  }

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        result.fetchNextPage();
      }
    })
  );

  useEffect(() => {
    const currentElement = loadingElement;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [loadingElement]);

  return (
    <div className={`DataTable ${className}`}>
      {result.data?.pages?.[0]?.total_count === 0 && (
        <p>There are no results to show.</p>
      )}

      {result.data?.pages?.map((result, i) => (
        <div key={`body${i}`}>
          {result.results.map((item) => (
            <Fragment key={itemKey(item)}>{itemView(item)}</Fragment>
          ))}
          <span ref={setLoadingElement} />
        </div>
      ))}

      {(result.isFetching || result.isFetchingNextPage) && <Loader />}
    </div>
  );
};

const DataList = <TItem extends {}, TQuery extends GenericSearchQuery>(
  props: DataListProps<TItem, TQuery>
) => {
  const [enableInfiniteScroll] = useInfiniteScroll();
  if (enableInfiniteScroll) {
    return <InfiniteDataList {...props} />;
  }
  return <PagedDataList {...props} />;
};

export { PagedDataList, InfiniteDataList, DataList };

import styles from "./index.module.css";
import { Fragment } from "react";
import { Loader } from "src/components/common/Loader";
import { Pager } from "src/components/common/Pager";
import type { Key } from "src/services/queryKeys";
import { useSettings } from "src/stores/settings";
import type { GenericSearchResult } from "src/types";
import type { GenericSearchQuery } from "src/types";
import { useInfiniteSearch, usePagedSearch } from "src/utils/useSearchQuery";

const DefaultNoItemsElement = <p>There are no results to show.</p>;

interface DataListProps<TItem, TQuery> {
  className?: string | undefined;
  queryKey: Key;
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
  queryKey,
  noItemsElement,
}: ConcreteDataListProps<TItem, TQuery>) => {
  const result = usePagedSearch(
    queryKey,
    searchQuery,
    searchFunc,
    onResultCountChange,
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
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
  queryKey,
  noItemsElement,
}: ConcreteDataListProps<TItem, TQuery>) => {
  const { result, scrollRef } = useInfiniteSearch(
    queryKey,
    searchQuery,
    searchFunc,
    onResultCountChange,
  );

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

      <span ref={scrollRef} />

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

export { PagedDataList, InfiniteDataList, DataList, DefaultNoItemsElement };

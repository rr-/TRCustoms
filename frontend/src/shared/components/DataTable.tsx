import "./DataTable.css";
import { Fragment } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useInfiniteQuery } from "react-query";
import { Loader } from "src/shared/components/Loader";
import { Pager } from "src/shared/components/Pager";
import { SortLink } from "src/shared/components/SortLink";
import { DISABLE_PAGING } from "src/shared/constants";
import type { GenericSearchResult } from "src/shared/types";
import type { GenericSearchQuery } from "src/shared/types";
import { createLocalStorageStateHook } from "use-local-storage-state";

const useInfiniteScroll = createLocalStorageStateHook("infiniteScroll", false);

interface DataTableColumn<TItem> {
  name: string;
  tooltip?: string | null;
  sortKey?: string | null;
  label: string;
  itemTooltip?: (item: TItem) => string | null;
  itemElement: (item: TItem) => React.ReactElement | string;
  footer?: () => React.ReactElement | string;
}

interface DataTableProps<TItem, TQuery> {
  className?: string | null;
  queryName: string;
  itemKey: (item: TItem) => string;
  columns: DataTableColumn<TItem>[];

  searchQuery: TQuery;
  searchFunc: (
    searchQuery: TQuery
  ) => Promise<GenericSearchResult<TQuery, TItem>>;

  onSearchQueryChange?: (searchQuery: TQuery) => any | null;
}

const DataTableHeader = <TItem extends {}, TQuery extends GenericSearchQuery>({
  className,
  columns,
  searchQuery,
  onSearchQueryChange,
}: DataTableProps<TItem, TQuery>) => {
  return (
    <thead className="DataTable--header">
      <tr className="DataTable--row">
        {columns.map((column) => (
          <th
            className={className ? `${className}--${column.name}` : undefined}
            title={column.tooltip || undefined}
            key={`head-${column.name}`}
          >
            {onSearchQueryChange && column.sortKey ? (
              <SortLink
                currentSort={searchQuery.sort || null}
                onSortChange={(sort) =>
                  onSearchQueryChange({ ...searchQuery, sort: sort })
                }
                targetSort={column.sortKey}
              >
                {column.label}
              </SortLink>
            ) : (
              column.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const DataTableBody = <TItem extends {}, TQuery extends GenericSearchQuery>({
  className,
  result,
  lastRowRef,
  itemKey,
  columns,
}: {
  result: {
    isLoading?: boolean;
    data?: GenericSearchResult<TQuery, TItem> | null;
    error?: Error | null;
  };
  lastRowRef?: any;
} & DataTableProps<TItem, TQuery>) => {
  if (result.error) {
    return (
      <tbody>
        <tr>
          <td colSpan={100}>{result.error.message}</td>
        </tr>
      </tbody>
    );
  }

  if (result.isLoading || !result.data) {
    return (
      <tbody>
        <tr>
          <td colSpan={100}>
            <Loader />
          </td>
        </tr>
      </tbody>
    );
  }

  if (!result.data.results.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={100}>There are no results to show.</td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="DataTable--body">
      {result.data.results.map((item) => (
        <tr key={itemKey(item)} className="DataTable--row" ref={lastRowRef}>
          {columns.map((column) => (
            <td
              className={className ? `${className}--${column.name}` : undefined}
              title={column.itemTooltip?.(item) || undefined}
              key={`${itemKey(item)}-${column.name}`}
            >
              {column.itemElement(item)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

const DataTableFooter = <TItem extends {}, TQuery extends GenericSearchQuery>({
  className,
  columns,
}: DataTableProps<TItem, TQuery>) => {
  return (
    <>
      {columns.some((column) => !!column.footer) && (
        <tfoot className="DataTable--footer">
          <tr className="DataTable--row">
            {columns.map((column) => (
              <th
                className={
                  className ? `${className}--${column.name}` : undefined
                }
                key={`foot-${column.name}`}
              >
                {column.footer?.()}
              </th>
            ))}
          </tr>
        </tfoot>
      )}
    </>
  );
};

const PagedDataTable = <TItem extends {}, TQuery extends GenericSearchQuery>(
  props: DataTableProps<TItem, TQuery>
) => {
  const {
    className,
    queryName,
    searchQuery,
    onSearchQueryChange,
    searchFunc,
  } = props;

  const result = useQuery<GenericSearchResult<TQuery, TItem> | null, Error>(
    [queryName, searchFunc, searchQuery],
    async () => searchFunc(searchQuery)
  );

  return (
    <>
      <table className={`DataTable ${className}`}>
        <DataTableHeader {...props} />
        <DataTableBody result={result} {...props} />
        <DataTableFooter {...props} />
      </table>

      {onSearchQueryChange &&
      result.data?.results?.length &&
      !result.data.disable_paging ? (
        <Pager
          onPageChange={(page) =>
            onSearchQueryChange({ ...searchQuery, page: page })
          }
          className={className ? `${className}--pager` : undefined}
          pagedResponse={result.data}
        />
      ) : null}
    </>
  );
};

const InfiniteDataTable = <TItem extends {}, TQuery extends GenericSearchQuery>(
  props: DataTableProps<TItem, TQuery>
) => {
  const { className, queryName, searchQuery, searchFunc } = props;

  const [loadingElement, setLoadingElement] = useState(null);
  const result = useInfiniteQuery<
    GenericSearchResult<TQuery, TItem> | null,
    Error
  >(
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
        return lastPage.current_page < lastPage.last_page
          ? lastPage.current_page + 1
          : undefined;
      },
      refetchOnWindowFocus: false,
    }
  );

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
    <>
      <table className={`DataTable ${className}`}>
        <DataTableHeader {...props} />

        {result.data?.pages?.map((result, i) => (
          <Fragment key={`body${i}`}>
            <DataTableBody
              lastRowRef={setLoadingElement}
              result={{ isLoading: false, data: result, error: undefined }}
              {...props}
            />
          </Fragment>
        ))}

        <tfoot>
          <tr>
            <td colSpan={100}>
              <div>
                <span
                  style={{
                    display:
                      result.isFetching || result.isFetchingNextPage
                        ? "block"
                        : "none",
                  }}
                >
                  Loading…
                </span>
              </div>
            </td>
          </tr>
        </tfoot>

        <DataTableFooter {...props} />
      </table>
    </>
  );
};

const DataTable = <TItem extends {}, TQuery extends GenericSearchQuery>(
  props: DataTableProps<TItem, TQuery>
) => {
  const [enableInfiniteScroll] = useInfiniteScroll();
  if (enableInfiniteScroll) {
    return <InfiniteDataTable {...props} />;
  }
  return <PagedDataTable {...props} />;
};

export type { DataTableColumn };
export { useInfiniteScroll, PagedDataTable, InfiniteDataTable, DataTable };

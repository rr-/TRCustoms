import styles from "./index.module.css";
import { useRef } from "react";
import { Fragment } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useInfiniteQuery } from "react-query";
import { Box } from "src/components/common/Box";
import { Loader } from "src/components/common/Loader";
import { Pager } from "src/components/common/Pager";
import { SortLink } from "src/components/common/SortLink";
import { DISABLE_PAGING } from "src/constants";
import { useInfiniteScroll } from "src/contexts/InfiniteScroll";
import { useSettings } from "src/contexts/SettingsContext";
import type { GenericSearchResult } from "src/types";
import type { GenericSearchQuery } from "src/types";

interface DataTableColumn<TItem> {
  name: string;
  tooltip?: string | undefined;
  sortKey?: string | undefined;
  label: string;
  itemTooltip?: ((item: TItem) => string) | undefined;
  itemElement: ({
    item,
    toggleActive,
  }: {
    item: TItem;
    toggleActive: () => void;
  }) => React.ReactNode;
  footer?: () => React.ReactNode;
}

interface DataTableProps<TItem, TQuery> {
  className?: string;
  queryName: string;
  itemKey: (item: TItem) => string;
  columns: DataTableColumn<TItem>[];

  detailsElement?: ((item: TItem) => React.ReactNode) | undefined;

  searchQuery: TQuery;
  searchFunc: (
    searchQuery: TQuery
  ) => Promise<GenericSearchResult<TQuery, TItem>>;

  onSearchQueryChange?: ((searchQuery: TQuery) => void) | undefined;
}

const DataTableHeader = <TItem extends {}, TQuery extends GenericSearchQuery>({
  columns,
  searchQuery,
  onSearchQueryChange,
}: DataTableProps<TItem, TQuery>) => {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            className={column.name || ""}
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
  result,
  itemKey,
  columns,
  detailsElement,
}: {
  result: {
    isLoading?: boolean | undefined;
    data?: GenericSearchResult<TQuery, TItem> | null | undefined;
    error?: Error | null | undefined;
  };
} & DataTableProps<TItem, TQuery>) => {
  const [activeRow, setActiveRow] = useState<string | null>(null);

  let message: React.ReactNode | null = null;
  if (result.error) {
    message = result.error.message;
  } else if (result.isLoading || !result.data) {
    message = <Loader />;
  } else if (!result.data.results.length) {
    message = "There are no results to show.";
  }

  if (message) {
    return (
      <tbody>
        <tr>
          <td colSpan={100}>{message}</td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {result?.data?.results.map((item) => {
        const key = itemKey(item);
        return (
          <Fragment key={key}>
            <tr>
              {columns.map((column) => (
                <td
                  className={column.name || ""}
                  title={column.itemTooltip?.(item) || undefined}
                  key={`${key}-${column.name}`}
                >
                  {column.itemElement({
                    item,
                    toggleActive: () =>
                      setActiveRow(key !== activeRow ? key : null),
                  })}
                </td>
              ))}
            </tr>
            {detailsElement && activeRow === key && (
              <tr className={styles.details}>
                <td colSpan={100}>
                  <Box>{detailsElement(item)}</Box>
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </tbody>
  );
};

const DataTableFooter = <TItem extends {}, TQuery extends GenericSearchQuery>({
  columns,
}: DataTableProps<TItem, TQuery>) => {
  return (
    <>
      {columns.some((column) => !!column.footer) && (
        <tfoot>
          <tr>
            {columns.map((column) => (
              <th key={`foot-${column.name}`} className={column.name || ""}>
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
      <table className={`${styles.table} ${className || ""}`}>
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

  const infiniteScrollRef = useRef(null);
  useInfiniteScroll(
    { element: infiniteScrollRef, fetch: () => result.fetchNextPage() },
    [result]
  );

  return (
    <table className={`${styles.table} ${className}`}>
      <DataTableHeader {...props} />

      {result.data?.pages?.map((result, i) => (
        <Fragment key={`body${i}`}>
          <DataTableBody
            result={{ isLoading: false, data: result, error: undefined }}
            {...props}
          />
        </Fragment>
      ))}

      <tfoot>
        <tr>
          <td colSpan={100}>
            <span ref={infiniteScrollRef} />

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
  );
};

const DataTable = <TItem extends {}, TQuery extends GenericSearchQuery>(
  props: DataTableProps<TItem, TQuery>
) => {
  const { infiniteScroll } = useSettings();
  if (infiniteScroll) {
    return <InfiniteDataTable {...props} />;
  }
  return <PagedDataTable {...props} />;
};

export type { DataTableColumn };
export { PagedDataTable, InfiniteDataTable, DataTable };

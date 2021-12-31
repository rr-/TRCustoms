import "./DataTable.css";
import { UseQueryResult } from "react-query";
import { useQuery } from "react-query";
import Loader from "src/shared/components/Loader";
import Pager from "src/shared/components/Pager";
import SortLink from "src/shared/components/SortLink";
import type { GenericSearchResult } from "src/shared/types";
import type { GenericSearchQuery } from "src/shared/types";

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
  itemKey: (TItem) => string;
  columns: DataTableColumn<TItem>[];

  searchQuery: TQuery;
  searchFunc: (
    searchQuery: TQuery
  ) => Promise<GenericSearchResult<TQuery, TItem> | null>;

  onSearchQueryChange?: (searchQuery: TQuery) => any | null;
}

const DataTableHeader = <TItem extends {}, TQuery extends GenericSearchQuery>({
  className,
  columns,
  searchQuery,
  onSearchQueryChange,
}: DataTableProps<TItem, TQuery>) => {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            className={className && `${className}--${column.name}`}
            title={column.tooltip}
            key={`head-${column.name}`}
          >
            {onSearchQueryChange && column.sortKey ? (
              <SortLink
                currentSort={searchQuery.sort}
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
  itemKey,
  columns,
}: {
  result: UseQueryResult<GenericSearchResult<TQuery, TItem>, Error>;
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
    <tbody>
      {result.data.results.map((item) => (
        <tr key={itemKey(item)}>
          {columns.map((column) => (
            <td
              className={className && `${className}--${column.name}`}
              title={column.itemTooltip?.(item)}
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
    columns.some((column) => !!column.footer) && (
      <tfoot>
        <tr>
          {columns.map((column) => (
            <th
              className={className && `${className}--${column.name}`}
              key={`foot-${column.name}`}
            >
              {column.footer?.()}
            </th>
          ))}
        </tr>
      </tfoot>
    )
  );
};

const DataTable = <TItem extends {}, TQuery extends GenericSearchQuery>(
  props: DataTableProps<TItem, TQuery>
) => {
  const { className, searchQuery, onSearchQueryChange, searchFunc } = props;

  const result = useQuery<GenericSearchResult<TQuery, TItem> | null, Error>(
    [searchFunc, searchQuery],
    async () => searchFunc(searchQuery)
  );

  return (
    <>
      <table className={`DataTable ${className} borderless`}>
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
          className={className && `${className}--pager`}
          pagedResponse={result.data}
        />
      ) : null}
    </>
  );
};

export type { DataTableColumn };
export { DataTable };

import "./DataTable.css";
import { UseQueryResult } from "react-query";
import Loader from "src/shared/components/Loader";
import Pager from "src/shared/components/Pager";
import SortLink from "src/shared/components/SortLink";
import type { PagedResponse } from "src/shared/types";

interface DataTableColumn<TItem> {
  name: string;
  tooltip?: string | null;
  sortKey?: string | null;
  label: string;
  itemTooltip?: (item: TItem) => string | null;
  itemElement: (item: TItem) => React.ReactElement | string;
  footer?: () => React.ReactElement | string;
}

interface DataTableProps<TItem> {
  className?: string | null;
  result: UseQueryResult<PagedResponse<TItem>, Error> | null;
  itemKey: (TItem) => string;
  columns: DataTableColumn<TItem>[];

  sort?: string | null;
  onSortChange?: (sort: string) => any | null;
  onPageChange?: (page: number) => any | null;
}

const DataTableHeader = <TItem extends {}>({
  className,
  columns,
  onSortChange,
  sort,
}: DataTableProps<TItem>) => {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            className={className && `${className}--${column.name}`}
            title={column.tooltip}
            key={`head-${column.name}`}
          >
            {onSortChange && column.sortKey ? (
              <SortLink
                currentSort={sort}
                onSortChange={onSortChange}
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

const DataTableBody = <TItem extends {}>({
  className,
  result,
  itemKey,
  columns,
}: DataTableProps<TItem>) => {
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

const DataTableFooter = <TItem extends {}>({
  className,
  columns,
}: DataTableProps<TItem>) => {
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

const DataTable = <TItem extends {}>(props: DataTableProps<TItem>) => {
  const { className, result, onPageChange } = props;

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  if (!result.data.results.length) {
    return <p>There are no result to show.</p>;
  }

  return (
    <>
      <table className={`DataTable ${className} borderless`}>
        <DataTableHeader {...props} />
        <DataTableBody {...props} />
        <DataTableFooter {...props} />
      </table>
      {onPageChange && !result.data.disable_paging && (
        <Pager
          onPageChange={onPageChange}
          className={className && `${className}--pager`}
          pagedResponse={result.data}
        />
      )}
    </>
  );
};

export type { DataTableColumn };
export { DataTable };

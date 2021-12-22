import "./DataTable.css";
import { UseQueryResult } from "react-query";
import Loader from "src/shared/components/Loader";
import Pager from "src/shared/components/Pager";
import SortLink from "src/shared/components/SortLink";
import type { PagedResponse } from "src/shared/types";

interface DataTableColumn<TDataTableItem> {
  name: string;
  tooltip?: string | null;
  sortKey?: string | null;
  label: string;
  itemTooltip?: (item: TDataTableItem) => string | null;
  itemElement: (item: TDataTableItem) => React.ReactElement | string;
  footer?: () => React.ReactElement | string;
}

interface DataTableProps<TDataTableItem> {
  className?: string | null;
  result: UseQueryResult<PagedResponse<TDataTableItem>, Error> | null;
  itemKey: (TDataTableItem) => string;
  columns: DataTableColumn<TDataTableItem>[];

  sort?: string | null;
  onSortChange?: (sort: string) => any | null;
  onPageChange?: (page: number) => any | null;
}

const DataTable = <TDataTableItem extends {}>({
  className,
  result,
  itemKey,
  columns,
  sort,
  onSortChange,
  onPageChange,
}: DataTableProps<TDataTableItem>) => {
  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  if (!result.data.results.length) {
    return <p>There are no result to show.</p>;
  }

  if (!className) {
    className = "DataTable";
  }

  return (
    <>
      <table className={`DataTable ${className} borderless`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className={`${className}--${column.name}`}
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
        <tbody>
          {result.data.results.map((item) => (
            <tr key={itemKey(item)}>
              {columns.map((column) => (
                <td
                  className={`${className}--${column.name}`}
                  title={column.itemTooltip?.(item)}
                  key={`${itemKey(item)}-${column.name}`}
                >
                  {column.itemElement(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {columns.some((column) => !!column.footer) && (
          <tfoot>
            <tr>
              {columns.map((column) => (
                <th
                  className={`${className}--${column.name}`}
                  key={`foot-${column.name}`}
                >
                  {column.footer?.()}
                </th>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
      {onPageChange && !result.data.disable_paging && (
        <Pager
          onPageChange={onPageChange}
          className={`${className}--pager`}
          pagedResponse={result.data}
        />
      )}
    </>
  );
};

export type { DataTableColumn };
export { DataTable };

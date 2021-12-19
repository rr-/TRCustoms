import { UseQueryResult } from "react-query";
import Pager from "src/components/Pager";
import Loader from "src/shared/components/Loader";
import SortLink from "src/shared/components/SortLink";
import { IPagedResponse } from "src/shared/types";

interface IDataTableColumn<TDataTableItem> {
  name: string;
  tooltip?: string | null;
  sortKey?: string | null;
  label: string;
  itemTooltip?: (item: TDataTableItem) => string | null;
  itemElement: (item: TDataTableItem) => React.ReactElement | string;
}

interface IDataTable<TDataTableItem> {
  className?: string | null;
  query: UseQueryResult<IPagedResponse<TDataTableItem>, Error> | null;
  itemKey: (TDataTableItem) => string;
  columns: IDataTableColumn<TDataTableItem>[];
}

interface TDataTableItem extends Object {}

const DataTable: React.FunctionComponent<IDataTable<TDataTableItem>> = ({
  className,
  query,
  itemKey,
  columns,
}) => {
  if (query.error) {
    return <p>{query.error.message}</p>;
  }

  if (query.isLoading || !query.data) {
    return <Loader />;
  }

  if (!query.data.results.length) {
    return <p>There are no results to show.</p>;
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
                key={column.name}
              >
                {column.sortKey ? (
                  <SortLink sort={column.sortKey}>{column.label}</SortLink>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {query.data.results.map((item) => (
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
      </table>
      {!query.data.disable_paging && (
        <Pager className={`${className}--pager`} pagedResponse={query.data} />
      )}
    </>
  );
};

export type { IDataTableColumn };
export { DataTable };

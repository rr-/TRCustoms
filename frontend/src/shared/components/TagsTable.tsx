import "./TagsTable.css";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import type { Tag } from "src/services/level.service";
import type { TagList } from "src/services/level.service";
import type { TagQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { formatDate } from "src/shared/utils";

interface TagsTableProps {
  query: TagQuery | null;
  onQueryChange?: (query: TagQuery) => any | null;
}

const TagsTable = ({ query, onQueryChange }: TagsTableProps) => {
  const result = useQuery<TagList, Error>(["tags", query], async () =>
    LevelService.getTags(query)
  );

  const columns: DataTableColumn<Tag>[] = [
    {
      name: "name",
      sortKey: "name",
      label: "Name",
      itemElement: (tag) => <Link to={`/?tags=${tag.id}`}>{tag.name}</Link>,
    },
    {
      name: "level-count",
      sortKey: "level_count",
      label: "Usages",
      itemElement: (tag) => `${tag.level_count}`,
    },
    {
      name: "created",
      sortKey: "created",
      label: "Created",
      itemElement: (tag) => formatDate(tag.created),
    },
    {
      name: "updated",
      sortKey: "last_updated",
      label: "Updated",
      itemElement: (tag) => formatDate(tag.last_updated),
    },
  ];

  const itemKey = (tag) => `${tag.id}`;

  return (
    <DataTable
      className="TagsTable"
      result={result}
      columns={columns}
      itemKey={itemKey}
      sort={query.sort}
      onSortChange={(sort) => onQueryChange?.({ ...query, sort: sort })}
    />
  );
};

export default TagsTable;

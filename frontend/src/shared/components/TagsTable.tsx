import "./TagsTable.css";
import { useQuery } from "react-query";
import type { Tag } from "src/services/tag.service";
import type { TagSearchResult } from "src/services/tag.service";
import type { TagSearchQuery } from "src/services/tag.service";
import { TagService } from "src/services/tag.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import TagLink from "src/shared/components/TagLink";
import { formatDate } from "src/shared/utils";

interface TagsTableProps {
  searchQuery: TagSearchQuery | null;
  onSearchQueryChange?: (searchQuery: TagSearchQuery) => any | null;
}

const TagsTable = ({ searchQuery, onSearchQueryChange }: TagsTableProps) => {
  const result = useQuery<TagSearchResult, Error>(
    ["tags", searchQuery],
    async () => TagService.searchTags(searchQuery)
  );

  const columns: DataTableColumn<Tag>[] = [
    {
      name: "name",
      sortKey: "name",
      label: "Name",
      itemElement: (tag) => <TagLink tag={tag} />,
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
      sort={searchQuery.sort}
      onSortChange={(sort) =>
        onSearchQueryChange?.({ ...searchQuery, sort: sort })
      }
      onPageChange={(page) =>
        onSearchQueryChange?.({ ...searchQuery, page: page })
      }
    />
  );
};

export default TagsTable;

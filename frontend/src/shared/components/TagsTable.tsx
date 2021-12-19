import { useQuery } from "react-query";
import { ITag } from "src/services/level.service";
import { ITagList } from "src/services/level.service";
import { ITagQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import { IDataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { formatDate } from "src/shared/utils";

const TagsTable = ({ query }: { query: ITagQuery | null }) => {
  const tagsQuery = useQuery<ITagList, Error>(["tags", query], async () =>
    LevelService.getTags(query)
  );

  const columns: IDataTableColumn<ITag>[] = [
    {
      name: "name",
      sortKey: "name",
      label: "Name",
      itemElement: (tag) => tag.name,
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

  return <DataTable query={tagsQuery} columns={columns} itemKey={itemKey} />;
};

export default TagsTable;

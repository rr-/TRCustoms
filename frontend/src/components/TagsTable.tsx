import "./TagsTable.css";
import { useQuery } from "react-query";
import type { DataTableColumn } from "src/components/DataTable";
import { DataTable } from "src/components/DataTable";
import { Loader } from "src/components/Loader";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { TagDeletePushButton } from "src/components/buttons/TagDeletePushButton";
import { TagMergePushButton } from "src/components/buttons/TagMergePushButton";
import { TagRenamePushButton } from "src/components/buttons/TagRenamePushButton";
import { TagLink } from "src/components/links/TagLink";
import type { TagListing } from "src/services/TagService";
import type { TagSearchQuery } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface TagsTableProps {
  searchQuery: TagSearchQuery;
  onSearchQueryChange?: ((searchQuery: TagSearchQuery) => void) | undefined;
}

interface TagsTableDetailsProps {
  tag: TagListing;
}

const TagsTableDetails = ({ tag }: TagsTableDetailsProps) => {
  const result = useQuery<TagListing[], Error>(
    ["tag", TagService.getStats, tag.id],
    async () => TagService.getStats(+tag.id)
  );

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  return (
    <>
      <p>
        <TagLink tag={tag}>{tag.level_count} levels</TagLink> use this tag.
      </p>
      {result.data.length > 0 ? (
        <>
          <p>Used with:</p>
          <ul>
            {result.data.map((tag) => (
              <li key={tag.id}>
                <TagLink tag={tag} />: {tag.level_count}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Not used with other tags.</p>
      )}
      <PermissionGuard require={UserPermission.editTags}>
        <div className="FormGridButtons--buttons">
          <TagMergePushButton tag={tag} />
          <TagRenamePushButton tag={tag} />
          <TagDeletePushButton tag={tag} />
        </div>
      </PermissionGuard>
    </>
  );
};

const TagsTable = ({ searchQuery, onSearchQueryChange }: TagsTableProps) => {
  const columns: DataTableColumn<TagListing>[] = [
    {
      name: "name",
      sortKey: "name",
      label: "Name",
      itemElement: ({ item, toggleActive }) => (
        <PushButton isPlain={true} disableTimeout={true} onClick={toggleActive}>
          {item.name}
        </PushButton>
      ),
    },
    {
      name: "level-count",
      sortKey: "level_count",
      label: "Usages",
      itemElement: ({ item }) => `${item.level_count}`,
    },
    {
      name: "created",
      sortKey: "created",
      label: "Created",
      itemElement: ({ item }) => formatDate(item.created),
    },
    {
      name: "updated",
      sortKey: "last_updated",
      label: "Updated",
      itemElement: ({ item }) => formatDate(item.last_updated),
    },
  ];

  const itemKey = (tag: TagListing) => `${tag.id}`;

  return (
    <DataTable
      className="TagsTable"
      queryName="tags"
      columns={columns}
      itemKey={itemKey}
      detailsElement={(item) => <TagsTableDetails tag={item} />}
      searchQuery={searchQuery}
      searchFunc={TagService.searchTags}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { TagsTable };

import styles from "./index.module.css";
import { useQuery } from "react-query";
import { TagDeleteButton } from "src/components/buttons/TagDeleteButton";
import { TagMergeButton } from "src/components/buttons/TagMergeButton";
import { TagRenameButton } from "src/components/buttons/TagRenameButton";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { Link } from "src/components/common/Link";
import { Loader } from "src/components/common/Loader";
import { PermissionGuard } from "src/components/common/PermissionGuard";
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
    async () => TagService.getStats(+tag.id),
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
        <div className={styles.buttons}>
          <TagMergeButton tag={tag} />
          <TagRenameButton tag={tag} />
          <TagDeleteButton tag={tag} />
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
      className: styles.name,
      itemElement: ({ item, toggleActive }) => (
        <Link onClick={toggleActive}>{item.name}</Link>
      ),
    },
    {
      name: "levelCount",
      sortKey: "level_count",
      label: "Usages",
      className: styles.levelCount,
      itemElement: ({ item }) => `${item.level_count}`,
    },
    {
      name: "created",
      sortKey: "created",
      label: "Created",
      className: styles.created,
      itemElement: ({ item }) => formatDate(item.created),
    },
    {
      name: "updated",
      sortKey: "last_updated",
      label: "Updated",
      className: styles.updated,
      itemElement: ({ item }) => formatDate(item.last_updated),
    },
  ];

  const itemKey = (tag: TagListing) => `${tag.id}`;

  return (
    <DataTable
      className={styles.table}
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

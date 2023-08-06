import { EditPlaylistItemButton } from "./EditButton";
import { RemovePlaylistItemButton } from "./RemoveButton";
import styles from "./index.module.css";
import { useContext } from "react";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { hasPermission } from "src/components/common/PermissionGuard";
import { LevelLink } from "src/components/links/LevelLink";
import { UserContext } from "src/contexts/UserContext";
import type { PlaylistItemListing } from "src/services/PlaylistService";
import type { PlaylistSearchQuery } from "src/services/PlaylistService";
import { PlaylistItemStatus } from "src/services/PlaylistService";
import { PlaylistService } from "src/services/PlaylistService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface PlaylistTableProps {
  userId: number;
  searchQuery: PlaylistSearchQuery;
  onSearchQueryChange?:
    | ((searchQuery: PlaylistSearchQuery) => void)
    | undefined;
}

const PlaylistTable = ({
  userId,
  searchQuery,
  onSearchQueryChange,
}: PlaylistTableProps) => {
  const loggedInUser = useContext(UserContext).user;

  let columns: DataTableColumn<PlaylistItemListing>[] = [
    {
      name: "status",
      sortKey: "status",
      label: "Status",
      itemElement: ({ item }) =>
        ({
          [PlaylistItemStatus.NotYetPlayed]: (
            <span className={styles.notYetPlayed}>Not yet played</span>
          ),
          [PlaylistItemStatus.Dropped]: (
            <span className={styles.dropped}>Dropped</span>
          ),
          [PlaylistItemStatus.Playing]: (
            <span className={styles.playing}>Playing</span>
          ),
          [PlaylistItemStatus.OnHold]: (
            <span className={styles.playing}>On hold</span>
          ),
          [PlaylistItemStatus.Finished]: (
            <span className={styles.finished}>Finished</span>
          ),
        }[item.status] || "Unknown"),
    },
    {
      name: "name",
      sortKey: "level__name",
      label: "Level name",
      itemElement: ({ item }) => (
        <LevelLink level={item.level}>{item.level.name}</LevelLink>
      ),
    },
    {
      name: "updated",
      sortKey: "last_updated",
      label: "Updated",
      itemElement: ({ item }) => formatDate(item.last_updated),
    },
  ];

  if (hasPermission(loggedInUser, UserPermission.editPlaylists, [userId])) {
    columns.push({
      name: "actions",
      label: "Actions",
      itemElement: ({ item }) => (
        <>
          <EditPlaylistItemButton
            user={item.user}
            level={item.level}
            item={item}
          />{" "}
          | <RemovePlaylistItemButton item={item} />
        </>
      ),
    });
  }

  const itemKey = (playlistItem: PlaylistItemListing) => `${playlistItem.id}`;

  return (
    <DataTable
      queryName="playlists"
      columns={columns}
      itemKey={itemKey}
      searchQuery={searchQuery}
      searchFunc={(query) => PlaylistService.search(userId, query)}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { PlaylistTable };

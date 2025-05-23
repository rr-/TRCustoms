import styles from "./index.module.css";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { PlaylistImportButton } from "src/components/buttons/PlaylistImportButton";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { PlaylistAddForm } from "src/components/common/PlaylistAddForm";
import { PlaylistTable } from "src/components/common/PlaylistTable";
import type { PlaylistSearchQuery } from "src/services/PlaylistService";
import { UserPermission } from "src/services/UserService";
import type { UserDetails } from "src/services/UserService";
import { resetQueries } from "src/utils/misc";

interface PlaylistTabProps {
  user: UserDetails;
}

const PlaylistTab = ({ user }: PlaylistTabProps) => {
  const [playlistSearchQuery, setPlaylistSearchQuery] =
    useState<PlaylistSearchQuery>({
      page: null,
      pageSize: 100,
      sort: "-status,-last_updated",
    });
  const queryClient = useQueryClient();

  const handleAdd = () => {
    resetQueries(queryClient, ["playlists"]);
  };

  return (
    <div className={styles.wrapper}>
      <PermissionGuard
        require={UserPermission.editPlaylists}
        owningUsers={[user]}
      >
        <div className={styles.toolbar}>
          <PlaylistAddForm userId={user.id} onAdd={handleAdd} />
          <PlaylistImportButton userId={user.id} />
        </div>
      </PermissionGuard>

      <PlaylistTable
        userId={user.id}
        searchQuery={playlistSearchQuery}
        onSearchQueryChange={setPlaylistSearchQuery}
      />
    </div>
  );
};

export { PlaylistTab };

import styles from "./index.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useState } from "react";
import { PlaylistImportButton } from "src/components/buttons/PlaylistImportButton";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { PlaylistLevelSearch } from "src/components/common/PlaylistLevelSearch";
import { PlaylistTable } from "src/components/common/PlaylistTable";
import type { PlaylistSearchQuery } from "src/services/PlaylistService";
import { getPlaylistSearchQuery } from "src/services/PlaylistService";
import { UserPermission } from "src/services/UserService";
import type { UserDetails } from "src/services/UserService";
import { resetQueries } from "src/utils/misc";

interface PlaylistTabProps {
  user: UserDetails;
}

const PlaylistTab = ({ user }: PlaylistTabProps) => {
  const [playlistSearchQuery, setPlaylistSearchQuery] =
    useState<PlaylistSearchQuery>(getPlaylistSearchQuery(user.id));
  const queryClient = useQueryClient();

  useEffect(() => {
    setPlaylistSearchQuery(getPlaylistSearchQuery(user.id));
  }, [user.id]);

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
          <PlaylistLevelSearch userId={user.id} onAdd={handleAdd} />
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

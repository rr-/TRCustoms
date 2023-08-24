import styles from "./index.module.css";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { PlaylistAddForm } from "src/components/common/PlaylistAddForm";
import { PlaylistTable } from "src/components/common/PlaylistTable";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { UserBasePage } from "src/components/pages/UserBasePage";
import type { UserBasePageChildRenderProps } from "src/components/pages/UserBasePage";
import type { PlaylistSearchQuery } from "src/services/PlaylistService";
import { UserPermission } from "src/services/UserService";
import { resetQueries } from "src/utils/misc";

interface UserPlaylistPageParams {
  userId: string;
}

const UserPlaylistPageView = ({ user }: UserBasePageChildRenderProps) => {
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState<
    PlaylistSearchQuery
  >({
    page: null,
    sort: "-status,-last_updated",
  });
  const queryClient = useQueryClient();

  const handleAdd = () => {
    resetQueries(queryClient, ["playlists"]);
  };

  return (
    <Section>
      <SectionHeader>Playlist</SectionHeader>

      <div className={styles.wrapper}>
        <PermissionGuard
          require={UserPermission.editPlaylists}
          owningUsers={[user]}
        >
          <PlaylistAddForm userId={user.id} onAdd={handleAdd} />
        </PermissionGuard>

        <PlaylistTable
          userId={user.id}
          searchQuery={playlistSearchQuery}
          onSearchQueryChange={setPlaylistSearchQuery}
        />
      </div>
    </Section>
  );
};

const UserPlaylistPage = () => {
  const { userId } = (useParams() as unknown) as UserPlaylistPageParams;
  return (
    <UserBasePage userId={+userId}>
      {(props: UserBasePageChildRenderProps) => (
        <UserPlaylistPageView {...props} />
      )}
    </UserBasePage>
  );
};

export { UserPlaylistPage };

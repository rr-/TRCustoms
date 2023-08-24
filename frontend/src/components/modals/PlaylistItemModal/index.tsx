import { PlaylistItemForm } from "src/components/common/PlaylistItemForm";
import { BaseModal } from "src/components/modals/BaseModal";
import type { LevelNested } from "src/services/LevelService";

interface PlaylistItemModalProps {
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  userId: number;
  level: LevelNested;
  onSubmit?: (() => void) | undefined;
  onNavigateToMyPlaylist?: (() => void) | undefined;
}

const PlaylistItemModal = ({
  isActive,
  onIsActiveChange,
  userId,
  level,
  onSubmit,
  onNavigateToMyPlaylist,
}: PlaylistItemModalProps) => {
  return (
    <BaseModal
      title="Playlist item details"
      isActive={isActive}
      onIsActiveChange={onIsActiveChange}
    >
      {isActive && (
        <PlaylistItemForm
          userId={userId}
          level={level}
          onSubmit={onSubmit}
          onNavigateToMyPlaylist={onNavigateToMyPlaylist}
        />
      )}
    </BaseModal>
  );
};

export { PlaylistItemModal };

import { PlaylistItemForm } from "src/components/common/PlaylistItemForm";
import { BaseModal } from "src/components/modals/BaseModal";
import type { LevelNested } from "src/services/LevelService";
import type { UserNested } from "src/services/UserService";

interface PlaylistItemModalProps {
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  user: UserNested;
  level: LevelNested;
  onSubmit?: (() => void) | undefined;
}

const PlaylistItemModal = ({
  isActive,
  onIsActiveChange,
  user,
  level,
  onSubmit,
}: PlaylistItemModalProps) => {
  return (
    <BaseModal
      title="Playlist item details"
      isActive={isActive}
      onIsActiveChange={onIsActiveChange}
    >
      <PlaylistItemForm user={user} level={level} onSubmit={onSubmit} />
    </BaseModal>
  );
};

export { PlaylistItemModal };

import { useQueryClient } from "react-query";
import { useQuery } from "react-query";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { PlaylistItemStatus } from "src/services/PlaylistService";
import { PlaylistService } from "src/services/PlaylistService";
import type { PlaylistItemDetails } from "src/services/PlaylistService";
import { resetQueries } from "src/utils/misc";
import { showAlertOnError } from "src/utils/misc";

interface PlaylistAddModalProps {
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  userId: number;
  levelId: number;
}

const PlaylistAddModal = ({
  isActive,
  onIsActiveChange,
  userId,
  levelId,
}: PlaylistAddModalProps) => {
  const queryClient = useQueryClient();
  const playlistItemResult = useQuery<PlaylistItemDetails, Error>(
    ["playlists", PlaylistService.get, userId, levelId],
    async () => PlaylistService.get(userId, levelId)
  );

  if (playlistItemResult.isLoading) {
    return <></>;
  }

  const playlistItem = playlistItemResult?.data;

  if (playlistItem && playlistItem?.status === PlaylistItemStatus.Finished) {
    return <></>;
  }

  const handleConfirm = () => {
    showAlertOnError(async () => {
      const status = PlaylistItemStatus.Finished;
      if (playlistItem?.id) {
        await PlaylistService.update(userId, playlistItem?.id, { status });
      } else {
        await PlaylistService.create(userId, { levelId, status });
      }
      resetQueries(queryClient, ["playlists"]);
    });
  };

  return (
    <ConfirmModal
      isActive={isActive}
      onIsActiveChange={onIsActiveChange}
      onConfirm={handleConfirm}
    >
      {playlistItem ? (
        <>Do you want to mark this level as finished in your playlist?</>
      ) : (
        <>Do you want to add this level to your playlist?</>
      )}
    </ConfirmModal>
  );
};

export { PlaylistAddModal };

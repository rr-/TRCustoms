import { useState } from "react";
import { forwardRef } from "react";
import { useImperativeHandle } from "react";
import { useQuery } from "react-query";
import { Checkbox } from "src/components/common/Checkbox";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { AutoPlaylistChoice } from "src/contexts/SettingsContext";
import { useSettings } from "src/contexts/SettingsContext";
import { PlaylistItemStatus } from "src/services/PlaylistService";
import { PlaylistService } from "src/services/PlaylistService";
import type { PlaylistItemDetails } from "src/services/PlaylistService";
import { showAlertOnError } from "src/utils/misc";

interface PlaylistAddModalProps {
  userId: number;
  levelId: number;
}

interface PlaylistAddModalHandle {
  trigger: () => void;
}

const PlaylistAddModal = forwardRef<
  PlaylistAddModalHandle,
  PlaylistAddModalProps
>((props, ref) => {
  const [isActive, setIsActive] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const { userId, levelId } = props;
  const { autoPlaylistChoice, setAutoPlaylistChoice } = useSettings();

  const playlistItemResult = useQuery<PlaylistItemDetails, Error>(
    ["playlists", PlaylistService.get, userId, levelId],
    async () => PlaylistService.get(userId, levelId)
  );

  useImperativeHandle(ref, () => ({
    trigger() {
      if (autoPlaylistChoice === AutoPlaylistChoice.Yes) {
        addLevelToPlaylist();
      } else if (autoPlaylistChoice === AutoPlaylistChoice.Ask) {
        setIsActive(true);
      }
    },
  }));

  const playlistItem = playlistItemResult?.data;
  const playlistItemAlreadyFinished =
    playlistItem && playlistItem?.status === PlaylistItemStatus.Finished;

  const addLevelToPlaylist = () => {
    showAlertOnError(async () => {
      const status = PlaylistItemStatus.Finished;
      if (playlistItem?.id) {
        await PlaylistService.update(userId, playlistItem?.id, { status });
      } else {
        await PlaylistService.create(userId, { levelId, status });
      }
    });
  };

  if (
    autoPlaylistChoice !== AutoPlaylistChoice.Ask ||
    playlistItemResult.isLoading ||
    playlistItemAlreadyFinished
  ) {
    return null;
  }

  const handleConfirm = () => {
    if (dontAskAgain) {
      setAutoPlaylistChoice(AutoPlaylistChoice.Yes);
    }
    addLevelToPlaylist();
    setIsActive(false);
  };

  const handleCancel = () => {
    if (dontAskAgain) {
      setAutoPlaylistChoice(AutoPlaylistChoice.No);
    }
  };

  return (
    <ConfirmModal
      isActive={isActive}
      onIsActiveChange={setIsActive}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmedChildren={<>Playlist updated.</>}
    >
      <>
        {playlistItem ? (
          <>Do you want to mark this level as finished in your playlist?</>
        ) : (
          <>Do you want to add this level to your playlist?</>
        )}
        <Checkbox
          label="Don't ask me again"
          onChange={(e) => setDontAskAgain(e.target.checked)}
          checked={dontAskAgain}
        />
      </>
    </ConfirmModal>
  );
});

export type { PlaylistAddModalHandle };
export { PlaylistAddModal };

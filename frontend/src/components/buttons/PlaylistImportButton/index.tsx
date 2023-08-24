import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { PlaylistService } from "src/services/PlaylistService";
import type { PlaylistImportResult } from "src/services/PlaylistService";
import { resetQueries } from "src/utils/misc";

interface PlaylistImportButtonProps {
  userId: number;
}

const PlaylistImportButton = ({ userId }: PlaylistImportButtonProps) => {
  const queryClient = useQueryClient();
  const [isModalActive, setIsModalActive] = useState(false);
  const [result, setResult] = useState<PlaylistImportResult>({
    updated_items: 0,
  });

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleConfirm = async () => {
    setResult(await PlaylistService.import(userId));
    resetQueries(queryClient, ["playlists"]);
  };

  return (
    <>
      <ConfirmModal
        title="Playlist import"
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleConfirm}
        confirmedChildren={
          result ? (
            <>Import complete. {result.updated_items} items added.</>
          ) : (
            <>Import in progress…</>
          )
        }
      >
        This action will populate the playlist with the levels you reviewed.
        <br />
        Existing levels will not be updated.
        <br />
        <br />
        Are you sure you want to continue?
      </ConfirmModal>

      <Button disableTimeout={true} onClick={handleButtonClick}>
        Import from reviews
      </Button>
    </>
  );
};

export { PlaylistImportButton };

import { useState } from "react";
import { useQueryClient } from "react-query";
import { Link } from "src/components/common/Link";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { PlaylistService } from "src/services/PlaylistService";
import type { PlaylistItemListing } from "src/services/PlaylistService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface RemovePlaylistItemButtonProps {
  item: PlaylistItemListing;
}

const RemovePlaylistItemButton = ({ item }: RemovePlaylistItemButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = () => {
    showAlertOnError(async () => {
      if (item.user) {
        await PlaylistService.delete(item.user.id, item.id);
      }
      resetQueries(queryClient, ["playlists"]);
    });
  };

  return (
    <>
      <ConfirmModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
      >
        Are you sure you want to remove this level?
      </ConfirmModal>

      <Link onClick={handleButtonClick}>Remove</Link>
    </>
  );
};

export { RemovePlaylistItemButton };

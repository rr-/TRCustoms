import { useState } from "react";
import { useQueryClient } from "react-query";
import { Link } from "src/components/common/Link";
import { PlaylistItemModal } from "src/components/modals/PlaylistItemModal";
import type { LevelNested } from "src/services/LevelService";
import type { PlaylistItemListing } from "src/services/PlaylistService";
import { resetQueries } from "src/utils/misc";

interface EditPlaylistItemButtonProps {
  userId: number;
  level: LevelNested;
  item: PlaylistItemListing;
}

const EditPlaylistItemButton = ({
  userId,
  level,
  item,
}: EditPlaylistItemButtonProps) => {
  const queryClient = useQueryClient();

  const [isModalActive, setIsModalActive] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const handleSubmit = () => {
    setIsChanged(true);
  };

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleNavigateToMyPlaylist = () => {
    resetQueries(queryClient, ["playlists"], false);
  };

  const handleIsModalActiveChange = (value: boolean) => {
    setIsModalActive(value);
    if (isChanged) {
      resetQueries(queryClient, ["playlists"], false);
    }
  };

  return (
    <>
      <PlaylistItemModal
        isActive={isModalActive}
        onIsActiveChange={handleIsModalActiveChange}
        userId={userId}
        level={level}
        onSubmit={handleSubmit}
        onNavigateToMyPlaylist={handleNavigateToMyPlaylist}
      />

      <Link onClick={handleButtonClick}>Edit</Link>
    </>
  );
};

export { EditPlaylistItemButton };

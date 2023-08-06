import { useContext } from "react";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { IconBookmark } from "src/components/icons";
import { PlaylistItemModal } from "src/components/modals/PlaylistItemModal";
import { UserContext } from "src/contexts/UserContext";
import type { LevelNested } from "src/services/LevelService";
import { PlaylistService } from "src/services/PlaylistService";
import { resetQueries } from "src/utils/misc";

interface LevelAddToMyPlaylistButtonProps {
  level: LevelNested;
}

const LevelAddToMyPlaylistButton = ({
  level,
}: LevelAddToMyPlaylistButtonProps) => {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();
  const [isChanged, setIsChanged] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleSubmit = () => {
    setIsChanged(true);
  };

  const handleIsModalActiveChange = (value: boolean) => {
    setIsModalActive(value);
    if (isChanged) {
      resetQueries(queryClient, ["playlists"]);
    }
  };

  if (!user) {
    return <></>;
  }

  return (
    <>
      <PlaylistItemModal
        isActive={isModalActive}
        onIsActiveChange={handleIsModalActiveChange}
        user={user}
        level={level}
        onSubmit={handleSubmit}
      />

      <Button icon={<IconBookmark />} onClick={handleButtonClick}>
        Add to my playlist
      </Button>
    </>
  );
};

export { LevelAddToMyPlaylistButton };

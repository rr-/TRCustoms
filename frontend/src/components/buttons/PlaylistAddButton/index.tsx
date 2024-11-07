import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { ButtonVariant } from "src/components/common/Button";
import { IconBookmark } from "src/components/icons";
import { PlaylistItemModal } from "src/components/modals/PlaylistItemModal";
import type { LevelNested } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";

interface PlaylistAddButtonProps {
  userId: number;
  level: LevelNested;
  variant?: ButtonVariant;
}

const PlaylistAddButton = ({
  userId,
  level,
  variant,
}: PlaylistAddButtonProps) => {
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

  return (
    <>
      <PlaylistItemModal
        isActive={isModalActive}
        onIsActiveChange={handleIsModalActiveChange}
        userId={userId}
        level={level}
        onSubmit={handleSubmit}
      />

      <Button
        variant={variant}
        icon={<IconBookmark />}
        onClick={handleButtonClick}
      >
        Add to my playlist
      </Button>
    </>
  );
};

export { PlaylistAddButton };

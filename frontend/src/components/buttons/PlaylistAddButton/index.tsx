import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "src/components/common/Button";
import { ButtonVariant } from "src/components/common/Button";
import { IconBookmark } from "src/components/icons";
import { PlaylistItemModal } from "src/components/modals/PlaylistItemModal";
import type { LevelNested } from "src/services/LevelService";
import { queryKeys } from "src/services/queryKeys";
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
      resetQueries(queryClient, [queryKeys.playlists.all]);
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

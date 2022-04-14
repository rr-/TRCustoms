import { useState } from "react";
import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconTrash } from "src/components/icons";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface LevelDeletePushButtonProps {
  level: LevelNested;
  onComplete?: (() => void) | undefined;
}

const LevelDeletePushButton = ({
  level,
  onComplete,
}: LevelDeletePushButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = () => {
    showAlertOnError(async () => {
      await LevelService.delete(level.id);
      onComplete?.();
      resetQueries(queryClient, ["level", "levels", "auditLogs"]);
    });
  };

  return (
    <>
      <ConfirmModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
      >
        Are you sure you want to delete level {level.name}?
      </ConfirmModal>
      <PushButton
        icon={<IconTrash />}
        onClick={handleButtonClick}
        tooltip="Hides this level from the level listing."
      >
        Delete
      </PushButton>
    </>
  );
};

export { LevelDeletePushButton };

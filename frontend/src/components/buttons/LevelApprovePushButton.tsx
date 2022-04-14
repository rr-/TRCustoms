import { useState } from "react";
import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconBadgeCheck } from "src/components/icons";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";
import { showAlertOnError } from "src/utils/misc";

interface LevelApprovePushButtonProps {
  level: LevelNested;
}

const LevelApprovePushButton = ({ level }: LevelApprovePushButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = async () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = () => {
    showAlertOnError(async () => {
      await LevelService.approve(level.id);
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
        Are you sure you want to approve level {level.name}?
      </ConfirmModal>

      <PushButton
        icon={<IconBadgeCheck />}
        onClick={handleButtonClick}
        tooltip="Shows this level from the level listing."
      >
        Approve
      </PushButton>
    </>
  );
};

export { LevelApprovePushButton };

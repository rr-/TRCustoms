import { useState } from "react";
import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconXCircle } from "src/components/icons";
import { PromptModal } from "src/components/modals/PromptModal";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";
import { showAlertOnError } from "src/utils/misc";

interface LevelRejectPushButtonProps {
  level: LevelNested;
}

const LevelRejectPushButton = ({ level }: LevelRejectPushButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = (reason: string) => {
    showAlertOnError(async () => {
      await LevelService.reject(level.id, reason);
      resetQueries(queryClient, ["level", "levels", "auditLogs"]);
    });
  };

  return (
    <>
      <PromptModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
        label="Reason"
      >
        Please provide the reason for rejecting this level.
      </PromptModal>

      <PushButton
        icon={<IconXCircle />}
        onClick={handleButtonClick}
        disableTimeout={true}
        tooltip="Hides this level from the level listing."
      >
        Reject
      </PushButton>
    </>
  );
};

export { LevelRejectPushButton };

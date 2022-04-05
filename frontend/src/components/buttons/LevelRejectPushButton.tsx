import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconXCircle } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";
import { showAlertOnError } from "src/utils/misc";

interface LevelRejectPushButtonProps {
  level: LevelNested;
}

const LevelRejectPushButton = ({ level }: LevelRejectPushButtonProps) => {
  const queryClient = useQueryClient();

  const handleRejectButtonClick = async () => {
    const reason = prompt(
      "Please provide the reason for rejecting this level."
    );
    if (!reason) {
      return;
    }
    showAlertOnError(async () => {
      await LevelService.reject(level.id, reason);
      resetQueries(queryClient, ["level", "levels", "auditLogs"]);
    });
  };

  return (
    <PushButton
      icon={<IconXCircle />}
      onClick={handleRejectButtonClick}
      tooltip="Hides this level from the level listing."
    >
      Reject
    </PushButton>
  );
};

export { LevelRejectPushButton };

import { XCircleIcon } from "@heroicons/react/outline";
import { useQueryClient } from "react-query";
import type { LevelNested } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import { PushButton } from "src/shared/components/PushButton";
import { resetQueries } from "src/shared/utils";
import { showAlertOnError } from "src/shared/utils";

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
      icon={<XCircleIcon className="icon" />}
      onClick={handleRejectButtonClick}
      tooltip="Hides this level from the level listing."
    >
      Reject
    </PushButton>
  );
};

export { LevelRejectPushButton };

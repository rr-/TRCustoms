import { BadgeCheckIcon } from "@heroicons/react/outline";
import { useQueryClient } from "react-query";
import type { LevelNested } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import { PushButton } from "src/shared/components/PushButton";
import { resetQueries } from "src/shared/utils";
import { showAlertOnError } from "src/shared/utils";

interface LevelApprovePushButtonProps {
  level: LevelNested;
}

const LevelApprovePushButton = ({ level }: LevelApprovePushButtonProps) => {
  const queryClient = useQueryClient();

  const handleApproveButtonClick = async () => {
    if (!window.confirm("Are you sure you want to approve this level?")) {
      return;
    }
    showAlertOnError(async () => {
      await LevelService.approve(level.id);
      resetQueries(queryClient, ["level", "levels", "auditLogs"]);
    });
  };

  return (
    <PushButton
      icon={<BadgeCheckIcon className="icon" />}
      onClick={handleApproveButtonClick}
      tooltip="Shows this level from the level listing."
    >
      Approve
    </PushButton>
  );
};

export { LevelApprovePushButton };

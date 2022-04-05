import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconBadgeCheck } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";
import { showAlertOnError } from "src/utils/misc";

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
      icon={<IconBadgeCheck />}
      onClick={handleApproveButtonClick}
      tooltip="Shows this level from the level listing."
    >
      Approve
    </PushButton>
  );
};

export { LevelApprovePushButton };

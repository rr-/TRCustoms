import { useQueryClient } from "react-query";
import { PromptPushButton } from "src/components/buttons/PromptPushButton";
import { IconXCircle } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";

interface LevelRejectPushButtonProps {
  level: LevelNested;
}

const LevelRejectPushButton = ({ level }: LevelRejectPushButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (result: string) => {
    await LevelService.reject(level.id, result);
    resetQueries(queryClient, ["level", "levels", "auditLogs"]);
  };

  return (
    <PromptPushButton
      text={<p>Please provide the reason for rejecting this level.</p>}
      promptLabel="Reason"
      buttonLabel="Reject"
      buttonTooltip="Hides this level from the level listing."
      icon={<IconXCircle />}
      big={true}
      onConfirm={handleConfirm}
    />
  );
};

export { LevelRejectPushButton };

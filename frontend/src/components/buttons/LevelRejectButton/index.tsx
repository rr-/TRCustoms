import { useQueryClient } from "react-query";
import { PromptButton } from "src/components/buttons/PromptButton";
import { ButtonVariant } from "src/components/common/Button";
import { IconXCircle } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";

interface LevelRejectButtonProps {
  level: LevelNested;
  variant?: ButtonVariant;
}

const LevelRejectButton = ({ level, variant }: LevelRejectButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (result: string) => {
    await LevelService.reject(level.id, result);
    resetQueries(queryClient, ["level", "levels", "auditLogs"]);
  };

  return (
    <PromptButton
      text={<p>Please provide the reason for rejecting this level.</p>}
      promptLabel="Reason"
      buttonLabel="Reject"
      buttonTooltip="Hides this level from the level listing."
      buttonVariant={variant}
      icon={<IconXCircle />}
      big={true}
      onConfirm={handleConfirm}
    />
  );
};

export { LevelRejectButton };

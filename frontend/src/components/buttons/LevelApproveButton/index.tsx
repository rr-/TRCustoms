import { useQueryClient } from "react-query";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { IconBadgeCheck } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";

interface LevelApproveButtonProps {
  level: LevelNested;
}

const LevelApproveButton = ({ level }: LevelApproveButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await LevelService.approve(level.id);
    resetQueries(queryClient, ["level", "levels", "auditLogs"]);
  };

  return (
    <ConfirmButton
      icon={<IconBadgeCheck />}
      text="Are you sure you want to approve this level?"
      buttonLabel="Approve"
      buttonTooltip="Makes this level visible in the global listing for all users."
      onConfirm={handleConfirm}
    />
  );
};

export { LevelApproveButton };

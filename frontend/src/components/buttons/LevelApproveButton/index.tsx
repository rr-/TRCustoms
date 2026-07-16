import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconBadgeCheck } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";

interface LevelApproveButtonProps {
  level: LevelNested;
}

const LevelApproveButton = ({ level }: LevelApproveButtonProps) => {
  const handleConfirm = useEntityAction(
    () => LevelService.approve(level.id),
    ["level", "levels", "auditLogs"],
  );

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

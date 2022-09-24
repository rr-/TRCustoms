import { useQueryClient } from "react-query";
import { ConfirmPushButton } from "src/components/buttons/ConfirmPushButton";
import { IconTrash } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";

interface LevelDeletePushButtonProps {
  level: LevelNested;
  onComplete?: (() => void) | undefined;
}

const LevelDeletePushButton = ({
  level,
  onComplete,
}: LevelDeletePushButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await LevelService.delete(level.id);
    onComplete?.();
    resetQueries(queryClient, ["level", "levels", "auditLogs"]);
  };

  return (
    <ConfirmPushButton
      icon={<IconTrash />}
      text={
        <>
          Are you sure you want to delete this level?
          <br /> This action cannot be undone.
        </>
      }
      buttonLabel="Delete"
      buttonTooltip="Deletes this level forever."
      onConfirm={handleConfirm}
    />
  );
};

export { LevelDeletePushButton };

import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconTrash } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { showAlertOnError } from "src/utils";
import { resetQueries } from "src/utils";

interface LevelDeletePushButtonProps {
  level: LevelNested;
  onComplete?: (() => void) | undefined;
}

const LevelDeletePushButton = ({
  level,
  onComplete,
}: LevelDeletePushButtonProps) => {
  const queryClient = useQueryClient();

  const handleDeleteButtonClick = async () => {
    if (window.confirm("Are you sure you want to delete this level?")) {
      showAlertOnError(async () => {
        await LevelService.delete(level.id);
        onComplete?.();
        resetQueries(queryClient, ["level", "levels", "auditLogs"]);
      });
    }
  };

  return (
    <PushButton
      icon={<IconTrash />}
      onClick={handleDeleteButtonClick}
      tooltip="Hides this level from the level listing."
    >
      Delete
    </PushButton>
  );
};

export { LevelDeletePushButton };

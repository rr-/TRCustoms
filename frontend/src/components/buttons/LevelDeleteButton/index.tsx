import { useQueryClient } from "react-query";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { ButtonVariant } from "src/components/common/Button";
import { IconTrash } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { resetQueries } from "src/utils/misc";

interface LevelDeleteButtonProps {
  level: LevelNested;
  variant?: ButtonVariant;
  onComplete?: (() => void) | undefined;
}

const LevelDeleteButton = ({
  level,
  variant,
  onComplete,
}: LevelDeleteButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await LevelService.delete(level.id);
    onComplete?.();
    resetQueries(queryClient, ["level", "levels", "auditLogs"]);
  };

  return (
    <ConfirmButton
      icon={<IconTrash />}
      text={
        <>
          Are you sure you want to delete this level?
          <br /> This action cannot be undone.
        </>
      }
      buttonLabel="Delete"
      buttonTooltip="Deletes this level forever."
      buttonVariant={variant}
      onConfirm={handleConfirm}
    />
  );
};

export { LevelDeleteButton };

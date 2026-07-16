import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { ButtonVariant } from "src/components/common/Button";
import { IconTrash } from "src/components/icons";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { queryKeys } from "src/services/queryKeys";

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
  const handleConfirm = useEntityAction(async () => {
    await LevelService.delete(level.id);
    onComplete?.();
  }, [queryKeys.levels.all, queryKeys.auditLogs.all]);

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

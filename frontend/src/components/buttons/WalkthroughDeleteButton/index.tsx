import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconTrash } from "src/components/icons";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { queryKeys } from "src/services/queryKeys";

interface WalkthroughDeleteButtonProps {
  walkthrough: WalkthroughDetails;
  onComplete?: (() => void) | undefined;
}

const WalkthroughDeleteButton = ({
  walkthrough,
  onComplete,
}: WalkthroughDeleteButtonProps) => {
  const handleConfirm = useEntityAction(async () => {
    await WalkthroughService.delete(walkthrough.id);
    onComplete?.();
  }, [queryKeys.walkthroughs.all, queryKeys.auditLogs.all]);

  return (
    <ConfirmButton
      icon={<IconTrash />}
      text={
        <>
          Are you sure you want to delete this walkthrough?
          <br />
          This action cannot be undone.
        </>
      }
      buttonLabel="Delete"
      buttonTooltip="Deletes this walkthrough forever."
      onConfirm={handleConfirm}
    />
  );
};

export { WalkthroughDeleteButton };

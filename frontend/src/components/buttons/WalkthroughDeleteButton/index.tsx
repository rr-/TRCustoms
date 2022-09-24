import { useQueryClient } from "react-query";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { IconTrash } from "src/components/icons";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { resetQueries } from "src/utils/misc";

interface WalkthroughDeleteButtonProps {
  walkthrough: WalkthroughDetails;
  onComplete?: (() => void) | undefined;
}

const WalkthroughDeleteButton = ({
  walkthrough,
  onComplete,
}: WalkthroughDeleteButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await WalkthroughService.delete(walkthrough.id);
    onComplete?.();
    resetQueries(queryClient, ["walkthrough", "walkthroughs", "auditLogs"]);
  };

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

import { useQueryClient } from "react-query";
import { ConfirmPushButton } from "src/components/buttons/ConfirmPushButton";
import { IconTrash } from "src/components/icons";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { resetQueries } from "src/utils/misc";

interface WalkthroughDeletePushButtonProps {
  walkthrough: WalkthroughDetails;
  onComplete?: (() => void) | undefined;
}

const WalkthroughDeletePushButton = ({
  walkthrough,
  onComplete,
}: WalkthroughDeletePushButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await WalkthroughService.delete(walkthrough.id);
    onComplete?.();
    resetQueries(queryClient, ["walkthrough", "walkthroughs", "auditLogs"]);
  };

  return (
    <ConfirmPushButton
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

export { WalkthroughDeletePushButton };

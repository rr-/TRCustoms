import { PromptButton } from "src/components/buttons/PromptButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconXCircle } from "src/components/icons";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { queryKeys } from "src/services/queryKeys";

interface WalkthroughRejectButtonProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughRejectButton = ({
  walkthrough,
}: WalkthroughRejectButtonProps) => {
  const handleConfirm = useEntityAction(
    async (result: string) => {
      await WalkthroughService.reject(walkthrough.id, result);
    },
    [queryKeys.walkthroughs.all, queryKeys.auditLogs.all],
  );

  return (
    <PromptButton
      text={<p>Please provide the reason for rejecting this walkthrough.</p>}
      promptLabel="Reason"
      buttonLabel="Reject"
      buttonTooltip="Hides this walkthrough from the walkthrough listing."
      icon={<IconXCircle />}
      big={true}
      onConfirm={handleConfirm}
    />
  );
};

export { WalkthroughRejectButton };

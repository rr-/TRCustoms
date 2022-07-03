import { useQueryClient } from "react-query";
import { PromptPushButton } from "src/components/buttons/PromptPushButton";
import { IconXCircle } from "src/components/icons";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { resetQueries } from "src/utils/misc";

interface WalkthroughRejectPushButtonProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughRejectPushButton = ({
  walkthrough,
}: WalkthroughRejectPushButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (result: string) => {
    await WalkthroughService.reject(walkthrough.id, result);
    resetQueries(queryClient, ["walkthrough", "walkthroughs", "auditLogs"]);
  };

  return (
    <PromptPushButton
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

export { WalkthroughRejectPushButton };

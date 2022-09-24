import { useQueryClient } from "react-query";
import { ConfirmPushButton } from "src/components/buttons/ConfirmPushButton";
import { IconBadgeCheck } from "src/components/icons";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { resetQueries } from "src/utils/misc";

interface LevelApprovePushButtonProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughApprovePushButton = ({
  walkthrough,
}: LevelApprovePushButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await WalkthroughService.approve(walkthrough.id);
    resetQueries(queryClient, ["walkthrough", "walkthroughs", "auditLogs"]);
  };

  return (
    <ConfirmPushButton
      icon={<IconBadgeCheck />}
      text="Are you sure you want to approve this walkthrough?"
      buttonLabel="Approve"
      buttonTooltip="Makes this walkthrough visible in the global listing for all users."
      onConfirm={handleConfirm}
    />
  );
};

export { WalkthroughApprovePushButton };

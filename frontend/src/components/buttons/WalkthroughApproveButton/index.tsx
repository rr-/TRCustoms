import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconBadgeCheck } from "src/components/icons";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { queryKeys } from "src/services/queryKeys";

interface WalkthroughApproveButtonProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughApproveButton = ({
  walkthrough,
}: WalkthroughApproveButtonProps) => {
  const handleConfirm = useEntityAction(
    () => WalkthroughService.approve(walkthrough.id),
    [queryKeys.walkthroughs.all, queryKeys.auditLogs.all],
  );

  return (
    <ConfirmButton
      icon={<IconBadgeCheck />}
      text="Are you sure you want to approve this walkthrough?"
      buttonLabel="Approve"
      buttonTooltip="Makes this walkthrough visible in the global listing for all users."
      onConfirm={handleConfirm}
    />
  );
};

export { WalkthroughApproveButton };

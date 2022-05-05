import { useState } from "react";
import { useQueryClient } from "react-query";
import { ConfirmPushButton } from "src/components/buttons/ConfirmPushButton";
import { IconSubmit } from "src/components/icons";
import { WalkthroughLink } from "src/components/links/WalkthroughLink";
import { BaseModal } from "src/components/modals/BaseModal";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { resetQueries } from "src/utils/misc";

interface WalkthroughPublishPushButtonProps {
  walkthrough: WalkthroughDetails;
  onComplete?: (() => void) | undefined;
}

const WalkthroughPublishPushButton = ({
  walkthrough,
  onComplete,
}: WalkthroughPublishPushButtonProps) => {
  const queryClient = useQueryClient();
  const [isModalActive, setIsModalActive] = useState(false);

  const handleConfirm = async () => {
    await WalkthroughService.publish(walkthrough.id);
    onComplete?.();
    resetQueries(queryClient, ["walkthrough", "walkthroughs", "auditLogs"]);
  };

  return (
    <>
      <BaseModal
        title="Information"
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
      >
        <>
          <WalkthroughLink
            walkthrough={{
              id: walkthrough.id,
              levelName: walkthrough.level.name,
            }}
          >
            Your walkthrough
          </WalkthroughLink>{" "}
          was submitted and it now needs to be approved by the staff. Please
          have patience :)
        </>
      </BaseModal>

      <ConfirmPushButton
        icon={<IconSubmit />}
        text={<>Are you sure you want to publish this walkthrough?</>}
        buttonLabel="Submit for approval"
        buttonTooltip="Publishes this walkthrough for the staff approval."
        onConfirm={handleConfirm}
      />
    </>
  );
};

export { WalkthroughPublishPushButton };

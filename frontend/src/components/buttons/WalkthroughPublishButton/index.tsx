import { useState } from "react";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconSubmit } from "src/components/icons";
import { WalkthroughLink } from "src/components/links/WalkthroughLink";
import { BaseModal } from "src/components/modals/BaseModal";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { queryKeys } from "src/services/queryKeys";

interface WalkthroughPublishButtonProps {
  walkthrough: WalkthroughDetails;
  onComplete?: (() => void) | undefined;
}

const WalkthroughPublishButton = ({
  walkthrough,
  onComplete,
}: WalkthroughPublishButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);

  const handleConfirm = useEntityAction(async () => {
    await WalkthroughService.publish(walkthrough.id);
    onComplete?.();
  }, [queryKeys.walkthroughs.all, queryKeys.auditLogs.all]);

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

      <ConfirmButton
        icon={<IconSubmit />}
        text={<>Are you sure you want to publish this walkthrough?</>}
        buttonLabel="Submit for approval"
        buttonTooltip="Publishes this walkthrough for the staff approval."
        onConfirm={handleConfirm}
      />
    </>
  );
};

export { WalkthroughPublishButton };

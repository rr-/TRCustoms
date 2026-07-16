import { PromptButton } from "src/components/buttons/PromptButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconPencil } from "src/components/icons";
import type { WalkthroughListing } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";

interface WalkthroughUpdateVideoButtonProps {
  walkthrough: WalkthroughListing;
}

const WalkthroughUpdateVideoButton = ({
  walkthrough,
}: WalkthroughUpdateVideoButtonProps) => {
  const handleConfirm = useEntityAction(
    async (result: string) => {
      await WalkthroughService.update(walkthrough.id, { text: result });
    },
    ["walkthrough", "walkthroughs", "auditLogs"],
  );

  return (
    <PromptButton
      text={<p>Please provide the new URL for this walkthrough.</p>}
      promptLabel="URL"
      buttonLabel="Update"
      buttonTooltip="Updates the URL for this walkthrough."
      icon={<IconPencil />}
      onConfirm={handleConfirm}
    />
  );
};

export { WalkthroughUpdateVideoButton };

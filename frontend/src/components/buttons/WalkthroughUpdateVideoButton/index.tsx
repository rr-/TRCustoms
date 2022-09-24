import { useQueryClient } from "react-query";
import { PromptButton } from "src/components/buttons/PromptButton";
import { IconPencil } from "src/components/icons";
import type { WalkthroughListing } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { resetQueries } from "src/utils/misc";

interface WalkthroughUpdateVideoButtonProps {
  walkthrough: WalkthroughListing;
}

const WalkthroughUpdateVideoButton = ({
  walkthrough,
}: WalkthroughUpdateVideoButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (result: string) => {
    await WalkthroughService.update(walkthrough.id, { text: result });
    resetQueries(queryClient, ["walkthrough", "walkthroughs", "auditLogs"]);
  };

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

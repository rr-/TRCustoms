import { Button } from "src/components/common/Button";
import { IconPencil } from "src/components/icons";
import type { WalkthroughDetails } from "src/services/WalkthroughService";

interface WalkthroughEditButtonProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughEditButton = ({ walkthrough }: WalkthroughEditButtonProps) => {
  return (
    <Button icon={<IconPencil />} to={`/walkthroughs/${walkthrough.id}/edit`}>
      Edit
    </Button>
  );
};

export { WalkthroughEditButton };

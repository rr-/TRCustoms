import { useQueryClient } from "@tanstack/react-query";
import { PromptButton } from "src/components/buttons/PromptButton";
import { IconXCircle } from "src/components/icons";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewListing } from "src/services/ReviewService";
import { resetQueries } from "src/utils/misc";

interface ReviewHideButtonProps {
  review: ReviewListing;
  onComplete?: (() => void) | undefined;
}

const ReviewHideButton = ({ review, onComplete }: ReviewHideButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (reason: string) => {
    await ReviewService.hide(review.id, { reason });
    onComplete?.();
    resetQueries(queryClient, ["reviews", "levels", "auditLogs"]);
  };

  return (
    <PromptButton
      text={<p>Please provide the reason for hiding this review.</p>}
      promptLabel="Reason"
      buttonLabel="Hide review"
      buttonTooltip="Hides this review from other users."
      icon={<IconXCircle />}
      big={true}
      onConfirm={handleConfirm}
    />
  );
};

export { ReviewHideButton };

import { PromptButton } from "src/components/buttons/PromptButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconXCircle } from "src/components/icons";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewListing } from "src/services/ReviewService";
import { queryKeys } from "src/services/queryKeys";

interface ReviewHideButtonProps {
  review: ReviewListing;
  onComplete?: (() => void) | undefined;
}

const ReviewHideButton = ({ review, onComplete }: ReviewHideButtonProps) => {
  const handleConfirm = useEntityAction(
    async (reason: string) => {
      await ReviewService.hide(review.id, { reason });
      onComplete?.();
    },
    [queryKeys.reviews.all, queryKeys.levels.all, queryKeys.auditLogs.all],
  );

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

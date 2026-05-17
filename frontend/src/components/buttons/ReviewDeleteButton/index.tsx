import { useQueryClient } from "react-query";
import { PromptButton } from "src/components/buttons/PromptButton";
import { IconTrash } from "src/components/icons";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewListing } from "src/services/ReviewService";
import { resetQueries } from "src/utils/misc";

interface ReviewDeleteButtonProps {
  review: ReviewListing;
  onComplete?: (() => void) | undefined;
}

const ReviewDeleteButton = ({
  review,
  onComplete,
}: ReviewDeleteButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (reason: string) => {
    await ReviewService.delete(review.id, { reason });
    onComplete?.();
    resetQueries(queryClient, ["reviews"]);
  };

  return (
    <PromptButton
      text={<p>Please provide the reason for deleting this review.</p>}
      promptLabel="Reason"
      buttonLabel="Delete review"
      buttonTooltip="Deletes this review and emails the author the reason."
      icon={<IconTrash />}
      big={true}
      onConfirm={handleConfirm}
    />
  );
};

export { ReviewDeleteButton };

import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconTrash } from "src/components/icons";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewListing } from "src/services/ReviewService";
import { resetQueries } from "src/utils";
import { showAlertOnError } from "src/utils";

interface ReviewDeletePushButtonProps {
  review: ReviewListing;
  onComplete?: (() => void) | undefined;
}

const ReviewDeletePushButton = ({
  review,
  onComplete,
}: ReviewDeletePushButtonProps) => {
  const queryClient = useQueryClient();

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      showAlertOnError(async () => {
        await ReviewService.delete(review.id);
        onComplete?.();
        resetQueries(queryClient, ["reviews"]);
      });
    }
  };

  return (
    <PushButton icon={<IconTrash />} onClick={handleDeleteClick}>
      Delete review
    </PushButton>
  );
};

export { ReviewDeletePushButton };

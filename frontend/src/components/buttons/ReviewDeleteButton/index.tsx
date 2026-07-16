import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconTrash } from "src/components/icons";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewListing } from "src/services/ReviewService";

interface ReviewDeleteButtonProps {
  review: ReviewListing;
  onComplete?: (() => void) | undefined;
}

const ReviewDeleteButton = ({
  review,
  onComplete,
}: ReviewDeleteButtonProps) => {
  const handleConfirm = useEntityAction(async () => {
    await ReviewService.delete(review.id);
    onComplete?.();
  }, ["reviews", "levels", "auditLogs"]);

  return (
    <ConfirmButton
      text={
        <>
          Are you sure you want to delete this review?
          <br /> This action cannot be undone.
        </>
      }
      buttonLabel="Delete"
      buttonTooltip="Deletes this review forever."
      icon={<IconTrash />}
      onConfirm={handleConfirm}
    />
  );
};

export { ReviewDeleteButton };

import { PushButton } from "src/components/PushButton";
import { IconPencil } from "src/components/icons";
import type { ReviewListing } from "src/services/ReviewService";

interface ReviewEditPushButtonProps {
  review: ReviewListing;
}

const ReviewEditPushButton = ({ review }: ReviewEditPushButtonProps) => {
  return (
    <PushButton
      to={`/levels/${review.level.id}/review/${review.id}/edit`}
      icon={<IconPencil />}
    >
      Edit review
    </PushButton>
  );
};

export { ReviewEditPushButton };

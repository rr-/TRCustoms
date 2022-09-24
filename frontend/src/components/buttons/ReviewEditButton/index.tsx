import { Button } from "src/components/common/Button";
import { IconPencil } from "src/components/icons";
import type { ReviewListing } from "src/services/ReviewService";

interface ReviewEditButtonProps {
  review: ReviewListing;
}

const ReviewEditButton = ({ review }: ReviewEditButtonProps) => {
  return (
    <Button
      to={`/levels/${review.level.id}/review/${review.id}/edit`}
      icon={<IconPencil />}
    >
      Edit review
    </Button>
  );
};

export { ReviewEditButton };

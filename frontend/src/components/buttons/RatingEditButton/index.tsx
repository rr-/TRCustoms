import { Button } from "src/components/common/Button";
import { IconPencil } from "src/components/icons";
import type { RatingListing } from "src/services/RatingService";

interface RatingEditButtonProps {
  rating: RatingListing;
}

const RatingEditButton = ({ rating }: RatingEditButtonProps) => {
  return (
    <Button
      to={`/levels/${rating.level.id}/rating/${rating.id}/edit`}
      icon={<IconPencil />}
    >
      Edit rating
    </Button>
  );
};

export { RatingEditButton };

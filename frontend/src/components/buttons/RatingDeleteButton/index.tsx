import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconTrash } from "src/components/icons";
import { RatingService } from "src/services/RatingService";
import type { RatingListing } from "src/services/RatingService";
import { queryKeys } from "src/services/queryKeys";

interface RatingDeleteButtonProps {
  rating: RatingListing;
  onComplete?: (() => void) | undefined;
}

const RatingDeleteButton = ({
  rating,
  onComplete,
}: RatingDeleteButtonProps) => {
  const handleConfirm = useEntityAction(async () => {
    await RatingService.delete(rating.id);
    onComplete?.();
  }, [queryKeys.ratings.all]);

  return (
    <ConfirmButton
      icon={<IconTrash />}
      text="Are you sure you want to delete this rating?"
      buttonLabel="Delete rating"
      onConfirm={handleConfirm}
    />
  );
};

export { RatingDeleteButton };

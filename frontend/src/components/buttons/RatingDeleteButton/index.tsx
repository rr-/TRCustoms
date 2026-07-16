import { useQueryClient } from "@tanstack/react-query";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { IconTrash } from "src/components/icons";
import { RatingService } from "src/services/RatingService";
import type { RatingListing } from "src/services/RatingService";
import { resetQueries } from "src/utils/misc";

interface RatingDeleteButtonProps {
  rating: RatingListing;
  onComplete?: (() => void) | undefined;
}

const RatingDeleteButton = ({
  rating,
  onComplete,
}: RatingDeleteButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await RatingService.delete(rating.id);
    onComplete?.();
    resetQueries(queryClient, ["ratings"]);
  };

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

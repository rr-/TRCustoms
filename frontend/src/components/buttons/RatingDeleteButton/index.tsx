import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { IconTrash } from "src/components/icons";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { RatingService } from "src/services/RatingService";
import type { RatingListing } from "src/services/RatingService";
import { resetQueries } from "src/utils/misc";
import { showAlertOnError } from "src/utils/misc";

interface RatingDeleteButtonProps {
  rating: RatingListing;
  onComplete?: (() => void) | undefined;
}

const RatingDeleteButton = ({
  rating,
  onComplete,
}: RatingDeleteButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = () => {
    showAlertOnError(async () => {
      await RatingService.delete(rating.id);
      onComplete?.();
      resetQueries(queryClient, ["ratings"]);
    });
  };

  return (
    <>
      <ConfirmModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
      >
        Are you sure you want to delete this rating?
      </ConfirmModal>

      <Button icon={<IconTrash />} onClick={handleButtonClick}>
        Delete rating
      </Button>
    </>
  );
};

export { RatingDeleteButton };

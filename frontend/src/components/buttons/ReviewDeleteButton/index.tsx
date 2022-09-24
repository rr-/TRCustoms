import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { IconTrash } from "src/components/icons";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewListing } from "src/services/ReviewService";
import { resetQueries } from "src/utils/misc";
import { showAlertOnError } from "src/utils/misc";

interface ReviewDeleteButtonProps {
  review: ReviewListing;
  onComplete?: (() => void) | undefined;
}

const ReviewDeleteButton = ({
  review,
  onComplete,
}: ReviewDeleteButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = () => {
    showAlertOnError(async () => {
      await ReviewService.delete(review.id);
      onComplete?.();
      resetQueries(queryClient, ["reviews"]);
    });
  };

  return (
    <>
      <ConfirmModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
      >
        Are you sure you want to delete this review?
      </ConfirmModal>

      <Button icon={<IconTrash />} onClick={handleButtonClick}>
        Delete review
      </Button>
    </>
  );
};

export { ReviewDeleteButton };

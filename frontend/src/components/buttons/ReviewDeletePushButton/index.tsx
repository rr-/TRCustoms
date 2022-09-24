import { useState } from "react";
import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconTrash } from "src/components/icons";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewListing } from "src/services/ReviewService";
import { resetQueries } from "src/utils/misc";
import { showAlertOnError } from "src/utils/misc";

interface ReviewDeletePushButtonProps {
  review: ReviewListing;
  onComplete?: (() => void) | undefined;
}

const ReviewDeletePushButton = ({
  review,
  onComplete,
}: ReviewDeletePushButtonProps) => {
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

      <PushButton icon={<IconTrash />} onClick={handleButtonClick}>
        Delete review
      </PushButton>
    </>
  );
};

export { ReviewDeletePushButton };

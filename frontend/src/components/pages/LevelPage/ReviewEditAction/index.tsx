import { useCallback } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { ReviewForm } from "src/components/common/ReviewForm";
import { PlaylistAddModal } from "src/components/modals/PlaylistAddModal";
import type { LevelNested } from "src/services/LevelService";
import type { ReviewDetails } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";

interface ReviewEditActionProps {
  level: LevelNested;
}

interface ReviewEditActionParams {
  reviewId: string;
}

const ReviewEditAction = ({ level }: ReviewEditActionProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const { reviewId } = (useParams() as unknown) as ReviewEditActionParams;
  const navigate = useNavigate();

  const reviewResult = useQuery<ReviewDetails, Error>(
    ["review", ReviewService.getReviewById, reviewId],
    async () => ReviewService.getReviewById(+reviewId)
  );

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${level.id}/reviews`);
  }, [navigate, level]);

  const handleSubmit = useCallback(() => {
    setIsModalActive(true);
  }, [setIsModalActive]);

  if (reviewResult.error) {
    return <p>{reviewResult.error.message}</p>;
  }

  if (reviewResult.isLoading || !reviewResult.data) {
    return <Loader />;
  }

  const review = reviewResult.data;

  return (
    <PageGuard
      require={UserPermission.editReviews}
      owningUserIds={[review.author.id]}
    >
      <PlaylistAddModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        levelId={level.id}
        userId={review.author.id}
      />

      <ReviewForm
        onGoBack={handleGoBack}
        onSubmit={handleSubmit}
        review={review}
        level={level}
      />
    </PageGuard>
  );
};

export { ReviewEditAction };

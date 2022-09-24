import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { ReviewForm } from "src/components/common/ReviewForm";
import { TitleContext } from "src/contexts/TitleContext";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import type { ReviewDetails } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";

interface LevelReviewEditPageParams {
  levelId: string;
  reviewId: string;
}

const LevelReviewEditPage = () => {
  const {
    levelId,
    reviewId,
  } = (useParams() as unknown) as LevelReviewEditPageParams;
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);

  const levelResult = useQuery<LevelNested, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const reviewResult = useQuery<ReviewDetails, Error>(
    ["review", ReviewService.getReviewById, reviewId],
    async () => ReviewService.getReviewById(+reviewId)
  );

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${levelId}`);
  }, [navigate, levelId]);

  useEffect(() => {
    setTitle(
      levelResult?.data?.name ? `Review for ${levelResult.data.name}` : "Review"
    );
  }, [setTitle, levelResult]);

  if (levelResult.error) {
    return <p>{levelResult.error.message}</p>;
  }
  if (reviewResult.error) {
    return <p>{reviewResult.error.message}</p>;
  }

  if (
    levelResult.isLoading ||
    !levelResult.data ||
    reviewResult.isLoading ||
    !reviewResult.data
  ) {
    return <Loader />;
  }

  const level = levelResult.data;
  const review = reviewResult.data;

  return (
    <PageGuard
      require={UserPermission.editReviews}
      owningUserIds={[review.author.id]}
    >
      <div className="LevelReviewEditPage">
        <h1>Reviewing {level.name}</h1>

        <ReviewForm onGoBack={handleGoBack} review={review} level={level} />
      </div>
    </PageGuard>
  );
};

export { LevelReviewEditPage };

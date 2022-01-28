import { useCallback } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { LevelNested } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import type { ReviewDetails } from "src/services/review.service";
import { ReviewService } from "src/services/review.service";
import { Loader } from "src/shared/components/Loader";
import { ReviewForm } from "src/shared/components/ReviewForm";

interface LevelReviewEditPageParams {
  levelId: string;
  reviewId: string;
}

const LevelReviewEditPage = () => {
  const navigate = useNavigate();
  const {
    levelId,
    reviewId,
  } = (useParams() as unknown) as LevelReviewEditPageParams;

  const levelResult = useQuery<LevelNested, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const reviewResult = useQuery<ReviewDetails, Error>(
    ["review", ReviewService.getReviewById, reviewId],
    async () => ReviewService.getReviewById(+reviewId)
  );

  const goBack = useCallback(() => {
    navigate(`/levels/${levelId}`);
  }, [navigate, levelId]);

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
    <div id="LevelReviewEditPage">
      <h1>Reviewing {level.name}</h1>

      <ReviewForm onGoBack={goBack} review={review} level={level} />
    </div>
  );
};

export { LevelReviewEditPage };
import { useCallback } from "react";
import { useContext } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { LevelNested } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import type { ReviewDetails } from "src/services/review.service";
import { ReviewService } from "src/services/review.service";
import { Loader } from "src/shared/components/Loader";
import { ReviewForm } from "src/shared/components/ReviewForm";
import { UserContext } from "src/shared/contexts/UserContext";

interface LevelReviewPageParams {
  levelId: string;
}

const LevelReviewPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { levelId } = (useParams() as unknown) as LevelReviewPageParams;

  const levelResult = useQuery<LevelNested, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const reviewResult = useQuery<ReviewDetails | null, Error>(
    ["review", ReviewService.getReviewByAuthorAndLevelIds, levelId],
    async () => ReviewService.getReviewByAuthorAndLevelIds(+levelId, user.id)
  );

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${levelId}`);
  }, [navigate, levelId]);

  if (levelResult.error) {
    return <p>{levelResult.error.message}</p>;
  }
  if (reviewResult.error) {
    return <p>{reviewResult.error.message}</p>;
  }

  if (levelResult.isLoading || !levelResult.data || reviewResult.isLoading) {
    return <Loader />;
  }

  const level = levelResult.data;
  const review = reviewResult.data;

  return (
    <div id="LevelReviewPage">
      <h1>Reviewing {level.name}</h1>

      <ReviewForm onGoBack={handleGoBack} review={review} level={level} />
    </div>
  );
};

export { LevelReviewPage };

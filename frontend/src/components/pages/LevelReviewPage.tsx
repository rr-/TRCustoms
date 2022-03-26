import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/Loader";
import { ReviewForm } from "src/components/ReviewForm";
import { TitleContext } from "src/contexts/TitleContext";
import { UserContext } from "src/contexts/UserContext";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import type { ReviewDetails } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";

interface LevelReviewPageParams {
  levelId: string;
}

const LevelReviewPage = () => {
  const { user } = useContext(UserContext);
  const { setTitle } = useContext(TitleContext);
  const navigate = useNavigate();
  const { levelId } = (useParams() as unknown) as LevelReviewPageParams;

  const levelResult = useQuery<LevelNested, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const reviewResult = useQuery<ReviewDetails | null, Error>(
    ["review", ReviewService.getReviewByAuthorAndLevelIds, levelId],
    async () => ReviewService.getReviewByAuthorAndLevelIds(+levelId, user?.id)
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

  if (levelResult.isLoading || !levelResult.data || reviewResult.isLoading) {
    return <Loader />;
  }

  const level = levelResult.data;
  const review = reviewResult.data;

  return (
    <div className="LevelReviewPage">
      <h1>Reviewing {level.name}</h1>

      <ReviewForm onGoBack={handleGoBack} review={review} level={level} />
    </div>
  );
};

export { LevelReviewPage };

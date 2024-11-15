import { useCallback } from "react";
import { useContext } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { ReviewForm } from "src/components/common/ReviewForm";
import { PlaylistAddModal } from "src/components/modals/PlaylistAddModal";
import { UserContext } from "src/contexts/UserContext";
import type { LevelNested } from "src/services/LevelService";
import type { ReviewDetails } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";

interface ReviewAddActionProps {
  level: LevelNested;
}

const ReviewAddAction = ({ level }: ReviewAddActionProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const reviewResult = useQuery<ReviewDetails | null, Error>(
    ["review", ReviewService.getReviewByAuthorAndLevelIds, level.id, user?.id],
    async () => ReviewService.getReviewByAuthorAndLevelIds(level.id, user?.id)
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

  if (reviewResult.isLoading) {
    return <Loader />;
  }

  const review = reviewResult.data;

  return (
    <PageGuard require={UserPermission.reviewLevels}>
      <PlaylistAddModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        levelId={level.id}
        userId={user.id}
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

export { ReviewAddAction };

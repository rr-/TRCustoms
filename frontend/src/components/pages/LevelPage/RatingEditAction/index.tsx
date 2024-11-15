import { useCallback } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { RatingForm } from "src/components/common/RatingForm";
import { PlaylistAddModal } from "src/components/modals/PlaylistAddModal";
import type { LevelNested } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";

interface LevelRatingEditPageParams {
  ratingId: string;
}

interface RatingEditActionProps {
  level: LevelNested;
}

const RatingEditAction = ({ level }: RatingEditActionProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const { ratingId } = (useParams() as unknown) as LevelRatingEditPageParams;
  const navigate = useNavigate();

  const ratingResult = useQuery<RatingDetails, Error>(
    ["rating", RatingService.getRatingById, ratingId],
    async () => RatingService.getRatingById(+ratingId)
  );

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${level.id}/ratings`);
  }, [navigate, level]);

  const handleSubmit = useCallback(() => {
    setIsModalActive(true);
  }, [setIsModalActive]);

  if (ratingResult.error) {
    return <p>{ratingResult.error.message}</p>;
  }

  if (ratingResult.isLoading || !ratingResult.data) {
    return <Loader />;
  }

  const rating = ratingResult.data;

  return (
    <PageGuard
      require={UserPermission.editRatings}
      owningUserIds={[rating.author.id]}
    >
      <PlaylistAddModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        levelId={level.id}
        userId={rating.author.id}
      />

      <RatingForm
        onGoBack={handleGoBack}
        onSubmit={handleSubmit}
        rating={rating}
        level={level}
      />
    </PageGuard>
  );
};

export { RatingEditAction };

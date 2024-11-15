import { useCallback } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { RatingForm } from "src/components/common/RatingForm";
import { SmartWrap } from "src/components/common/SmartWrap";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { PlaylistAddModal } from "src/components/modals/PlaylistAddModal";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";

interface LevelRatingEditPageParams {
  levelId: string;
  ratingId: string;
}

const LevelRatingEditPage = () => {
  const [isModalActive, setIsModalActive] = useState(false);
  const {
    levelId,
    ratingId,
  } = (useParams() as unknown) as LevelRatingEditPageParams;
  const navigate = useNavigate();

  const levelResult = useQuery<LevelNested, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const ratingResult = useQuery<RatingDetails, Error>(
    ["rating", RatingService.getRatingById, ratingId],
    async () => RatingService.getRatingById(+ratingId)
  );

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${levelId}`);
  }, [navigate, levelId]);

  const handleSubmit = useCallback(() => {
    setIsModalActive(true);
  }, [setIsModalActive]);

  usePageMetadata(
    () => ({
      ready: !levelResult.isLoading,
      title: levelResult.data?.name
        ? `Rating for ${levelResult.data.name}`
        : "Rating",
    }),
    [levelResult]
  );

  if (levelResult.error) {
    return <p>{levelResult.error.message}</p>;
  }
  if (ratingResult.error) {
    return <p>{ratingResult.error.message}</p>;
  }

  if (
    levelResult.isLoading ||
    !levelResult.data ||
    ratingResult.isLoading ||
    !ratingResult.data
  ) {
    return <Loader />;
  }

  const level = levelResult.data;
  const rating = ratingResult.data;

  return (
    <PageGuard
      require={UserPermission.editRatings}
      owningUserIds={[rating.author.id]}
    >
      <PlainLayout header={<SmartWrap text={`Rating ${level.name}`} />}>
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
      </PlainLayout>
    </PageGuard>
  );
};

export { LevelRatingEditPage };

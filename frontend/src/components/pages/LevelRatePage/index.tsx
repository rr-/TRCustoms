import { useCallback } from "react";
import { useContext } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { RatingForm } from "src/components/common/RatingForm";
import { SmartWrap } from "src/components/common/SmartWrap";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { PlaylistAddModal } from "src/components/modals/PlaylistAddModal";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserContext } from "src/contexts/UserContext";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";

interface LevelRatePageParams {
  levelId: string;
}

const LevelRatePage = () => {
  const [isModalActive, setIsModalActive] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { levelId } = (useParams() as unknown) as LevelRatePageParams;

  const levelResult = useQuery<LevelNested, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const ratingResult = useQuery<RatingDetails | null, Error>(
    ["rating", RatingService.getRatingByAuthorAndLevelIds, levelId, user?.id],
    async () => RatingService.getRatingByAuthorAndLevelIds(+levelId, user?.id)
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

  if (levelResult.isLoading || !levelResult.data || ratingResult.isLoading) {
    return <Loader />;
  }

  const level = levelResult.data;
  const rating = ratingResult.data;

  return (
    <PlainLayout header={<SmartWrap text={`Rating ${level.name}`} />}>
      <PlaylistAddModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        levelId={+levelId}
        userId={user.id}
      />

      <RatingForm
        onGoBack={handleGoBack}
        onSubmit={handleSubmit}
        rating={rating}
        level={level}
      />
    </PlainLayout>
  );
};

export { LevelRatePage };

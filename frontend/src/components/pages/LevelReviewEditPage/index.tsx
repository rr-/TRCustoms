import { useCallback } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { ReviewForm } from "src/components/common/ReviewForm";
import { SmartWrap } from "src/components/common/SmartWrap";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { PlaylistAddModal } from "src/components/modals/PlaylistAddModal";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
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
  const [isModalActive, setIsModalActive] = useState(false);
  const {
    levelId,
    reviewId,
  } = (useParams() as unknown) as LevelReviewEditPageParams;
  const navigate = useNavigate();

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

  const handleSubmit = useCallback(() => {
    setIsModalActive(true);
  }, [setIsModalActive]);

  usePageMetadata(
    () => ({
      ready: !levelResult.isLoading,
      title: levelResult.data?.name
        ? `Review for ${levelResult.data.name}`
        : "Review",
    }),
    [levelResult]
  );

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
      <PlainLayout header={<SmartWrap text={`Reviewing ${level.name}`} />}>
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
      </PlainLayout>
    </PageGuard>
  );
};

export { LevelReviewEditPage };

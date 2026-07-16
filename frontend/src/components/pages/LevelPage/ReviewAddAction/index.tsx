import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRef } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { ReviewForm } from "src/components/common/ReviewForm";
import type { PlaylistAddModalHandle } from "src/components/modals/PlaylistAddModal";
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
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const playlistModalRef = useRef<PlaylistAddModalHandle>(null);

  const reviewResult = useQuery<ReviewDetails | null, Error>({
    queryKey: [
      "review",
      ReviewService.getReviewByAuthorAndLevelIds,
      level.id,
      user?.id,
    ],
    queryFn: async () =>
      ReviewService.getReviewByAuthorAndLevelIds(level.id, user?.id),
  });

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${level.id}/reviews`);
  }, [navigate, level]);

  const handleSubmit = () => {
    if (playlistModalRef.current) {
      playlistModalRef.current.trigger();
    }
  };

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
        ref={playlistModalRef}
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

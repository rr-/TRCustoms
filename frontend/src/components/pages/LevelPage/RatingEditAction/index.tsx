import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { RatingForm } from "src/components/forms/RatingForm";
import type { PlaylistAddModalHandle } from "src/components/modals/PlaylistAddModal";
import { PlaylistAddModal } from "src/components/modals/PlaylistAddModal";
import type { LevelNested } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";
import { useConfig } from "src/stores/config";

interface RatingEditActionProps {
  level: LevelNested;
}

const RatingEditAction = ({ level }: RatingEditActionProps) => {
  const { ratingId = "" } = useParams();
  const { config } = useConfig();
  const navigate = useNavigate();
  const playlistModalRef = useRef<PlaylistAddModalHandle>(null);

  const ratingResult = useQuery<RatingDetails, Error>({
    queryKey: queryKeys.ratings.detail(ratingId),
    queryFn: async () => RatingService.getRatingById(+ratingId),
  });

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${level.id}/ratings`);
  }, [navigate, level]);

  const handleSubmit = () => {
    if (playlistModalRef.current) {
      playlistModalRef.current.trigger();
    }
  };

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
        ref={playlistModalRef}
        levelId={level.id}
        userId={rating.author.id}
      />

      <RatingForm
        config={config}
        onGoBack={handleGoBack}
        onSubmit={handleSubmit}
        rating={rating}
        level={level}
      />
    </PageGuard>
  );
};

export { RatingEditAction };

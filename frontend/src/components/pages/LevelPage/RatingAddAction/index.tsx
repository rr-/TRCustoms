import { useCallback } from "react";
import { useContext } from "react";
import { useRef } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { RatingForm } from "src/components/common/RatingForm";
import type { PlaylistAddModalHandle } from "src/components/modals/PlaylistAddModal";
import { PlaylistAddModal } from "src/components/modals/PlaylistAddModal";
import { ConfigContext } from "src/contexts/ConfigContext";
import { UserContext } from "src/contexts/UserContext";
import type { LevelNested } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";

interface RatingAddActionProps {
  level: LevelNested;
}

const RatingAddAction = ({ level }: RatingAddActionProps) => {
  const { user } = useContext(UserContext);
  const { config } = useContext(ConfigContext);
  const navigate = useNavigate();
  const playlistModalRef = useRef<PlaylistAddModalHandle>(null);

  const ratingResult = useQuery<RatingDetails | null, Error>(
    ["rating", RatingService.getRatingByAuthorAndLevelIds, level.id, user?.id],
    async () => RatingService.getRatingByAuthorAndLevelIds(level.id, user?.id),
  );

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

  if (ratingResult.isLoading || !config) {
    return <Loader />;
  }

  const rating = ratingResult.data;

  return (
    <PageGuard require={UserPermission.rateLevels}>
      <PlaylistAddModal
        ref={playlistModalRef}
        levelId={level.id}
        userId={user.id}
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

export { RatingAddAction };

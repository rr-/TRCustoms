import { useContext } from "react";
import { useQuery } from "react-query";
import { Button } from "src/components/common/Button";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { IconThumbUp } from "src/components/icons";
import { UserContext } from "src/contexts/UserContext";
import type { LevelDetails } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";

interface AddOrEditRatingButtonProps {
  level: LevelDetails;
}

const AddOrEditRatingButton = ({ level }: AddOrEditRatingButtonProps) => {
  const { user } = useContext(UserContext);

  const ratingResult = useQuery<RatingDetails | null, Error>(
    ["rating", RatingService.getRatingByAuthorAndLevelIds, level.id, user?.id],
    async () => RatingService.getRatingByAuthorAndLevelIds(level.id, user?.id),
  );

  if (level.authors.some((author) => author.id === user?.id)) {
    return null;
  }

  const hasOwnRating = ratingResult?.data;

  return (
    <PermissionGuard require={UserPermission.rateLevels}>
      <Button icon={<IconThumbUp />} to={`/levels/${level.id}/rating`}>
        {hasOwnRating ? "Update your rating" : "Rate this level"}
      </Button>
    </PermissionGuard>
  );
};

export { AddOrEditRatingButton };

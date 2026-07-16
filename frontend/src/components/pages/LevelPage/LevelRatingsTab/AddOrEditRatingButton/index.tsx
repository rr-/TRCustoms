import { useQuery } from "@tanstack/react-query";
import { Button } from "src/components/common/Button";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { IconThumbUp } from "src/components/icons";
import type { LevelDetails } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";
import { useUser } from "src/stores/user";

interface AddOrEditRatingButtonProps {
  level: LevelDetails;
}

const AddOrEditRatingButton = ({ level }: AddOrEditRatingButtonProps) => {
  const { user } = useUser();

  const ratingResult = useQuery<RatingDetails | null, Error>({
    queryKey: [
      "rating",
      RatingService.getRatingByAuthorAndLevelIds,
      level.id,
      user?.id,
    ],
    queryFn: async () =>
      RatingService.getRatingByAuthorAndLevelIds(level.id, user?.id),
  });

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

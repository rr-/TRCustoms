import { useQuery } from "@tanstack/react-query";
import { Button } from "src/components/common/Button";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { IconAnnotation } from "src/components/icons";
import type { LevelDetails } from "src/services/LevelService";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewDetails } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";
import { useUser } from "src/stores/user";

interface AddOrEditReviewButtonProps {
  level: LevelDetails;
}

const AddOrEditReviewButton = ({ level }: AddOrEditReviewButtonProps) => {
  const { user } = useUser();

  const reviewResult = useQuery<ReviewDetails | null, Error>({
    queryKey: queryKeys.reviews.byAuthorAndLevel(level.id, user?.id),
    queryFn: async () =>
      ReviewService.getReviewByAuthorAndLevelIds(level.id, user?.id),
  });

  if (level.authors.some((author) => author.id === user?.id)) {
    return null;
  }

  const hasOwnReview = reviewResult?.data;

  return (
    <PermissionGuard require={UserPermission.reviewLevels}>
      <Button icon={<IconAnnotation />} to={`/levels/${level.id}/review`}>
        {hasOwnReview ? "Update your review" : "Write a review"}
      </Button>
    </PermissionGuard>
  );
};

export { AddOrEditReviewButton };

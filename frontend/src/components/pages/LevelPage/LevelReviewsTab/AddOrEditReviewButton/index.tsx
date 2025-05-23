import { useContext } from "react";
import { useQuery } from "react-query";
import { Button } from "src/components/common/Button";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { IconAnnotation } from "src/components/icons";
import { UserContext } from "src/contexts/UserContext";
import type { LevelDetails } from "src/services/LevelService";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewDetails } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";

interface AddOrEditReviewButtonProps {
  level: LevelDetails;
}

const AddOrEditReviewButton = ({ level }: AddOrEditReviewButtonProps) => {
  const { user } = useContext(UserContext);

  const reviewResult = useQuery<ReviewDetails | null, Error>(
    ["review", ReviewService.getReviewByAuthorAndLevelIds, level.id, user?.id],
    async () => ReviewService.getReviewByAuthorAndLevelIds(level.id, user?.id),
  );

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

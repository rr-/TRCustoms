import "./ReviewsList.css";
import { DataList } from "src/components/DataList";
import { Markdown } from "src/components/Markdown";
import { PermissionGuard } from "src/components/PermissionGuard";
import { UserPicture } from "src/components/UserPicture";
import { ReviewDeletePushButton } from "src/components/buttons/ReviewDeletePushButton";
import { ReviewEditPushButton } from "src/components/buttons/ReviewEditPushButton";
import { IconThumbUp } from "src/components/icons";
import { IconThumbDown } from "src/components/icons";
import { IconDotsCircleHorizontal } from "src/components/icons";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import type { ReviewListing } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface ReviewsListProps {
  showLevels: boolean;
  searchQuery: ReviewSearchQuery;
  onResultCountChange?: ((count: number) => void) | undefined;
  onSearchQueryChange?: ((searchQuery: ReviewSearchQuery) => void) | undefined;
}

interface ReviewViewProps {
  review: ReviewListing;
  showLevels: boolean;
}

const ReviewView = ({ review, showLevels }: ReviewViewProps) => {
  const classNames = ["Review"];

  const position = review.rating_class?.position || 0;
  let badge: React.ReactNode;
  if (position > 0) {
    classNames.push("positive");
    badge = (
      <>
        <IconThumbUp />
        Positive
      </>
    );
  } else if (position < 0) {
    classNames.push("negative");
    badge = (
      <>
        <IconThumbDown />
        Negative
      </>
    );
  } else {
    classNames.push("neutral");
    badge = (
      <>
        <IconDotsCircleHorizontal />
        Neutral
      </>
    );
  }

  return (
    <div className={classNames.join(" ")}>
      <div className="Review--badge">{badge}</div>

      <div className="Review--content ChildMarginClear">
        {showLevels ? (
          <p className="ReviewsList--level">
            Review on <LevelLink level={review.level} />
          </p>
        ) : null}

        <Markdown>{review.text || "No review text is available."}</Markdown>
      </div>

      <footer className="Review--footer">
        <div className="Review--footerInfo">
          <UserLink className="Review--userLink" user={review.author}>
            <>
              <UserPicture className="Review--userPic" user={review.author} />
              {review.author.username}
            </>
          </UserLink>

          <span>Reviews: {review.author.reviewed_level_count}</span>

          <span>Posted: {formatDate(review.created)}</span>
        </div>

        <div className="Review--buttons">
          <PermissionGuard
            require={UserPermission.editReviews}
            owningUsers={[review.author]}
          >
            <ReviewEditPushButton review={review} />
          </PermissionGuard>

          <PermissionGuard require={UserPermission.deleteReviews}>
            <ReviewDeletePushButton review={review} />
          </PermissionGuard>
        </div>
      </footer>
    </div>
  );
};

const ReviewsList = ({
  showLevels,
  searchQuery,
  onResultCountChange,
  onSearchQueryChange,
}: ReviewsListProps) => {
  return (
    <DataList
      searchQuery={searchQuery}
      onResultCountChange={onResultCountChange}
      queryName="reviews"
      onSearchQueryChange={onSearchQueryChange}
      searchFunc={ReviewService.searchReviews}
      itemKey={(review: ReviewListing) => review.id.toString()}
      itemView={(review: ReviewListing) => (
        <ReviewView review={review} showLevels={showLevels} />
      )}
    />
  );
};

export { ReviewsList };

import "./ReviewsList.css";
import { ThumbUpIcon } from "@heroicons/react/outline";
import { ThumbDownIcon } from "@heroicons/react/outline";
import { DotsCircleHorizontalIcon } from "@heroicons/react/outline";
import { DataList } from "src/components/DataList";
import { Markdown } from "src/components/Markdown";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { UserPicture } from "src/components/UserPicture";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import type { ReviewListing } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils";

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
        <ThumbUpIcon className="icon" />
        Positive
      </>
    );
  } else if (position < 0) {
    classNames.push("negative");
    badge = (
      <>
        <ThumbDownIcon className="icon" />
        Negative
      </>
    );
  } else {
    classNames.push("neutral");
    badge = (
      <>
        <DotsCircleHorizontalIcon className="icon" />
        Neutral
      </>
    );
  }

  return (
    <div className={classNames.join(" ")}>
      <div className="Review--badge">{badge}</div>

      <div className="Review--content">
        {showLevels ? (
          <p className="ReviewsList--level">
            Review on <LevelLink level={review.level} />
          </p>
        ) : null}

        <Markdown>{review.text || "No review text is available."}</Markdown>
      </div>

      <footer className="Review--footer">
        <UserLink className="Review--userLink" user={review.author}>
          <>
            <UserPicture className="Review--userPic" user={review.author} />
            {review.author.username}
          </>
        </UserLink>

        <dl className="Review--userInfo">
          <div className="Review--userInfoTerm">
            <dt>Reviews</dt>
            <dd className="Review--userInfoDefinition">
              {review.author.reviewed_level_count}
            </dd>
          </div>

          <div className="Review--userInfoTerm">
            <dt>Posted</dt>
            <dd className="Review--userInfoDefinition">
              {formatDate(review.created)}
            </dd>
          </div>
        </dl>

        <PermissionGuard
          require={UserPermission.editReviews}
          owningUsers={[review.author]}
        >
          <PushButton
            to={`/levels/${review.level.id}/review/${review.id}/edit`}
          >
            Edit review
          </PushButton>
        </PermissionGuard>
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

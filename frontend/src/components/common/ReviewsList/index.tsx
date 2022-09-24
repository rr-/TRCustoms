import "./index.css";
import { useState } from "react";
import { ReviewDeletePushButton } from "src/components/buttons/ReviewDeletePushButton";
import { ReviewEditPushButton } from "src/components/buttons/ReviewEditPushButton";
import { DataList } from "src/components/common/DataList";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { PushButton } from "src/components/common/PushButton";
import { UserPicture } from "src/components/common/UserPicture";
import { IconThumbUp } from "src/components/icons";
import { IconThumbDown } from "src/components/icons";
import { IconDotsCircleHorizontal } from "src/components/icons";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import { Markdown } from "src/components/markdown/Markdown";
import type { ReviewListing } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

const REVIEW_EXCERPT_CUTOFF = 1200;

interface ReviewsListProps {
  showLevels: boolean;
  showExcerpts?: boolean | undefined;
  searchQuery: ReviewSearchQuery;
  onResultCountChange?: ((count: number) => void) | undefined;
  onSearchQueryChange?: ((searchQuery: ReviewSearchQuery) => void) | undefined;
}

interface ReviewViewProps {
  review: ReviewListing;
  showLevels: boolean;
  showExcerpts: boolean;
}

const ReviewView = ({ review, showLevels, showExcerpts }: ReviewViewProps) => {
  const [isExcerptExpanded, setIsExcerptExpanded] = useState(false);
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

  const handleReadMoreClick = () => {
    setIsExcerptExpanded((isExcerptExpanded) => !isExcerptExpanded);
  };

  const fullText = review.text ?? "No review text is available";
  const shortText =
    fullText.length >= REVIEW_EXCERPT_CUTOFF
      ? fullText.substr(0, fullText.lastIndexOf(" ", REVIEW_EXCERPT_CUTOFF)) +
        "…"
      : fullText;

  return (
    <div className={classNames.join(" ")}>
      <div className="Review--badge">{badge}</div>

      <div className="Review--content ChildMarginClear">
        {showLevels ? (
          <p className="ReviewsList--level">
            Review on <LevelLink level={review.level} />
          </p>
        ) : null}

        {showExcerpts && shortText !== fullText ? (
          <>
            <Markdown>{isExcerptExpanded ? fullText : shortText}</Markdown>
            <PushButton
              isPlain={true}
              disableTimeout={true}
              onClick={handleReadMoreClick}
            >
              ({isExcerptExpanded ? "Read less" : "Read more"})
            </PushButton>
          </>
        ) : (
          <Markdown>{review.text || "No review text is available."}</Markdown>
        )}
      </div>

      <footer className="Review--footer">
        <div className="Review--footerInfo">
          <UserLink className="Review--userLink" user={review.author}>
            <>
              <UserPicture user={review.author} />
              {review.author.username}
            </>
          </UserLink>

          <span>Reviews posted: {review.author.reviewed_level_count}</span>

          <span>Posted on: {formatDate(review.created)}</span>
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
  showExcerpts,
  searchQuery,
  onResultCountChange,
  onSearchQueryChange,
}: ReviewsListProps) => {
  return (
    <DataList
      searchQuery={searchQuery}
      onResultCountChange={onResultCountChange}
      queryName="reviews"
      className="ReviewsList"
      onSearchQueryChange={onSearchQueryChange}
      searchFunc={ReviewService.searchReviews}
      itemKey={(review: ReviewListing) => review.id.toString()}
      itemView={(review: ReviewListing) => (
        <ReviewView
          review={review}
          showLevels={showLevels}
          showExcerpts={showExcerpts ?? false}
        />
      )}
    />
  );
};

export { ReviewsList };

import styles from "./index.module.css";
import { useState } from "react";
import { ReviewDeleteButton } from "src/components/buttons/ReviewDeleteButton";
import { ReviewEditButton } from "src/components/buttons/ReviewEditButton";
import { DataList } from "src/components/common/DataList";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
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
  const classNames = [styles.wrapper];

  const position = review.rating_class?.position || 0;
  let badge: React.ReactNode;
  if (position > 0) {
    classNames.push(styles.positive);
    badge = (
      <>
        <IconThumbUp />
        Positive
      </>
    );
  } else if (position < 0) {
    classNames.push(styles.negative);
    badge = (
      <>
        <IconThumbDown />
        Negative
      </>
    );
  } else {
    classNames.push(styles.neutral);
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
      <div className={styles.badge}>{badge}</div>

      <div className={`${styles.content} ChildMarginClear`}>
        {showLevels ? (
          <p>
            Review on <LevelLink level={review.level} />
          </p>
        ) : null}

        {showExcerpts && shortText !== fullText ? (
          <>
            <Markdown>{isExcerptExpanded ? fullText : shortText}</Markdown>
            <Link onClick={handleReadMoreClick}>
              ({isExcerptExpanded ? "Read less" : "Read more"})
            </Link>
          </>
        ) : (
          <Markdown>{review.text || "No review text is available."}</Markdown>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.info}>
          <UserLink className={styles.userLink} user={review.author}>
            <>
              <div className={styles.userPic}>
                <UserPicture user={review.author} />
              </div>
              {review.author.username}
            </>
          </UserLink>

          <span>Reviews posted: {review.author.reviewed_level_count}</span>

          <span>Posted on: {formatDate(review.created)}</span>
        </div>

        <div className={styles.buttons}>
          <PermissionGuard
            require={UserPermission.editReviews}
            owningUsers={[review.author]}
          >
            <ReviewEditButton review={review} />
          </PermissionGuard>

          <PermissionGuard require={UserPermission.deleteReviews}>
            <ReviewDeleteButton review={review} />
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

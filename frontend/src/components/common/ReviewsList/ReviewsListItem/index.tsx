import styles from "./index.module.css";
import { useEffect } from "react";
import { useState } from "react";
import { ReviewDeleteButton } from "src/components/buttons/ReviewDeleteButton";
import { ReviewEditButton } from "src/components/buttons/ReviewEditButton";
import { ReviewHideButton } from "src/components/buttons/ReviewHideButton";
import { BurgerMenu } from "src/components/common/BurgerMenu";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { ReviewVoteControls } from "src/components/common/ReviewsList/ReviewVoteControls";
import { UserPicture } from "src/components/common/UserPicture";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import { Markdown } from "src/components/markdown/Markdown";
import type { ReviewListing } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";
import { useUser } from "src/stores/user";
import { extractErrorMessage } from "src/utils/misc";
import { formatDate } from "src/utils/string";

const REVIEW_EXCERPT_CUTOFF = 1200;

interface ReviewsListItemProps {
  review: ReviewListing;
  showLevels: boolean;
  showExcerpts: boolean;
}

const ReviewsListItem = ({
  review,
  showLevels,
  showExcerpts,
}: ReviewsListItemProps) => {
  const { user } = useUser();
  const [isExcerptExpanded, setIsExcerptExpanded] = useState(false);
  const [isVotePending, setIsVotePending] = useState(false);
  const [voteState, setVoteState] = useState({
    upvoteCount: review.upvote_count ?? 0,
    downvoteCount: review.downvote_count ?? 0,
    currentUserVote: review.current_user_vote,
    canVote: review.can_vote,
  });
  useEffect(() => {
    setVoteState({
      upvoteCount: review.upvote_count ?? 0,
      downvoteCount: review.downvote_count ?? 0,
      currentUserVote: review.current_user_vote,
      canVote: review.can_vote,
    });
  }, [review]);

  const handleReadMoreClick = () => {
    setIsExcerptExpanded((isExcerptExpanded) => !isExcerptExpanded);
  };

  const fullText = review.text ?? "No review text is available";
  const shortText =
    fullText.length >= REVIEW_EXCERPT_CUTOFF
      ? fullText.substr(0, fullText.lastIndexOf(" ", REVIEW_EXCERPT_CUTOFF)) +
        "…"
      : fullText;

  const reviewVoteState = {
    ...review,
    upvote_count: voteState.upvoteCount,
    downvote_count: voteState.downvoteCount,
    current_user_vote: voteState.currentUserVote,
    can_vote: voteState.canVote,
  };

  const handleVoteClick = async (vote: -1 | 1) => {
    if (isVotePending || !user) {
      return;
    }

    const previousVote = voteState.currentUserVote;
    const nextVote = previousVote === vote ? null : vote;
    const upvoteDelta = (nextVote === 1 ? 1 : 0) - (previousVote === 1 ? 1 : 0);
    const downvoteDelta =
      (nextVote === -1 ? 1 : 0) - (previousVote === -1 ? 1 : 0);

    const previousState = voteState;
    setIsVotePending(true);
    setVoteState((current) => ({
      ...current,
      currentUserVote: nextVote,
      upvoteCount: current.upvoteCount + upvoteDelta,
      downvoteCount: current.downvoteCount + downvoteDelta,
    }));

    try {
      const updatedReview = await ReviewService.vote(review.id, { vote });
      setVoteState({
        upvoteCount: updatedReview.upvote_count ?? 0,
        downvoteCount: updatedReview.downvote_count ?? 0,
        currentUserVote: updatedReview.current_user_vote,
        canVote: updatedReview.can_vote,
      });
    } catch (error) {
      setVoteState(previousState);
      const message = extractErrorMessage(error);
      if (message) {
        alert(message);
      }
    }
    setIsVotePending(false);
  };

  const header = (
    <header className={styles.header}>
      <div className={styles.info}>
        <div className={styles.userInfo}>
          <UserLink className={styles.userLink} user={review.author}>
            <div className={styles.userPic}>
              <UserPicture user={review.author} />
            </div>
          </UserLink>
          <div>
            <UserLink className={styles.userLink} user={review.author}>
              {review.author.username}
            </UserLink>
            <br />
            <small>Reviews posted: {review.author.reviewed_level_count}</small>
          </div>
        </div>
      </div>

      <div className={styles.postedMeta}>
        <ReviewVoteControls
          review={reviewVoteState}
          isInteractive={!!user}
          onVote={handleVoteClick}
        />
        <div className={styles.dates}>
          {review.last_user_content_updated ? (
            <small>
              Updated on: {formatDate(review.last_user_content_updated)}
            </small>
          ) : null}

          <small>Posted on: {formatDate(review.created)}</small>
        </div>
      </div>

      <BurgerMenu>
        <PermissionGuard
          require={UserPermission.editReviews}
          owningUsers={[review.author]}
        >
          <ReviewEditButton review={review} />
        </PermissionGuard>
        <PermissionGuard require={UserPermission.editReviews}>
          <ReviewHideButton review={review} />
        </PermissionGuard>
        <PermissionGuard require={UserPermission.deleteReviews}>
          <ReviewDeleteButton review={review} />
        </PermissionGuard>
      </BurgerMenu>
    </header>
  );

  return (
    <div className={styles.wrapper}>
      {header}

      <div className={`${styles.content} ChildMarginClear`}>
        {review.is_hidden ? (
          <p className={styles.hiddenNotice}>
            {review.author.id === user?.id
              ? "Review visible only to you."
              : "Review hidden."}{" "}
            Reason: {review.rejection_reason}
          </p>
        ) : null}

        {showLevels ? (
          <p>
            Review on <LevelLink level={review.level} />
          </p>
        ) : null}

        {showExcerpts && shortText !== fullText ? (
          <>
            <Markdown allowColors={false}>
              {isExcerptExpanded ? fullText : shortText}
            </Markdown>
            <Link onClick={handleReadMoreClick}>
              ({isExcerptExpanded ? "Read less" : "Read more"})
            </Link>
          </>
        ) : (
          <Markdown allowColors={false}>
            {review.text || "No review text is available."}
          </Markdown>
        )}
      </div>
    </div>
  );
};

export { ReviewsListItem };

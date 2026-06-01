import styles from "./index.module.css";
import { Link } from "src/components/common/Link";
import { IconThumbDown, IconThumbUp } from "src/components/icons";
import type { ReviewListing } from "src/services/ReviewService";

interface ReviewVoteControlsProps {
  review: ReviewListing;
  isInteractive?: boolean | undefined;
  onVote: (vote: -1 | 1) => void;
}

const ReviewVoteControls = ({
  review,
  isInteractive = true,
  onVote,
}: ReviewVoteControlsProps) => {
  const isVotingEnabled = isInteractive && review.can_vote;

  return (
    <div className={styles.wrapper}>
      <Link
        className={`${styles.voteButton} ${
          !isVotingEnabled ? styles.disabled : ""
        } ${review.current_user_vote === 1 ? styles.active : ""}`}
        aria-disabled={!isVotingEnabled}
        onClick={isVotingEnabled ? () => onVote(1) : undefined}
      >
        <IconThumbUp />
        <span>{review.upvote_count}</span>
      </Link>

      <Link
        className={`${styles.voteButton} ${
          !isVotingEnabled ? styles.disabled : ""
        } ${review.current_user_vote === -1 ? styles.active : ""}`}
        aria-disabled={!isVotingEnabled}
        onClick={isVotingEnabled ? () => onVote(-1) : undefined}
      >
        <IconThumbDown />
        <span>{review.downvote_count}</span>
      </Link>
    </div>
  );
};

export { ReviewVoteControls };

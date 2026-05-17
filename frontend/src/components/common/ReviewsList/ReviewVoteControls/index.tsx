import styles from "./index.module.css";
import { Link } from "src/components/common/Link";
import { IconThumbDown, IconThumbUp } from "src/components/icons";
import type { ReviewListing } from "src/services/ReviewService";

interface ReviewVoteControlsProps {
  review: ReviewListing;
  onVote: (vote: -1 | 1) => void;
}

const ReviewVoteControls = ({ review, onVote }: ReviewVoteControlsProps) => {
  if (!review.can_vote) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Link
        className={`${styles.voteButton} ${
          review.current_user_vote === 1 ? styles.active : ""
        }`}
        onClick={() => onVote(1)}
      >
        <IconThumbUp />
        <span>{review.upvote_count}</span>
      </Link>

      <Link
        className={`${styles.voteButton} ${
          review.current_user_vote === -1 ? styles.active : ""
        }`}
        onClick={() => onVote(-1)}
      >
        <IconThumbDown />
        <span>{review.downvote_count}</span>
      </Link>
    </div>
  );
};

export { ReviewVoteControls };

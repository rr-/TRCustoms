import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "src/components/common/Link";
import { ReviewVotersPopup } from "src/components/common/ReviewsList/ReviewVotersPopup";
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
  const [openVoters, setOpenVoters] = useState<-1 | 1 | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (openVoters === null) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpenVoters(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenVoters(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openVoters]);

  const renderVote = (vote: -1 | 1) => {
    const count =
      (vote === 1 ? review.upvote_count : review.downvote_count) ?? 0;
    const label = vote === 1 ? "Upvote" : "Downvote";

    return (
      <span className={styles.vote}>
        <Link
          className={`${styles.voteButton} ${
            !isVotingEnabled ? styles.disabled : ""
          } ${review.current_user_vote === vote ? styles.active : ""}`}
          aria-disabled={!isVotingEnabled}
          ariaLabel={label}
          onClick={isVotingEnabled ? () => onVote(vote) : undefined}
        >
          {vote === 1 ? <IconThumbUp /> : <IconThumbDown />}
        </Link>

        <button
          className={styles.countButton}
          type="button"
          disabled={!count}
          aria-expanded={openVoters === vote}
          aria-label={`Show who cast ${
            vote === 1 ? "an upvote" : "a downvote"
          }`}
          onClick={() =>
            setOpenVoters((current) => (current === vote ? null : vote))
          }
        >
          {count}
        </button>

        {openVoters === vote ? (
          <ReviewVotersPopup reviewId={review.id} vote={vote} />
        ) : null}
      </span>
    );
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {renderVote(1)}
      {renderVote(-1)}
    </div>
  );
};

export { ReviewVoteControls };

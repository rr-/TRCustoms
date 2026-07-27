import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "src/components/common/Loader";
import { UserPicture } from "src/components/common/UserPicture";
import { UserLink } from "src/components/links/UserLink";
import { ReviewService } from "src/services/ReviewService";
import { queryKeys } from "src/services/queryKeys";

interface ReviewVotersPopupProps {
  reviewId: number;
  vote: -1 | 1;
}

const ReviewVotersPopup = ({ reviewId, vote }: ReviewVotersPopupProps) => {
  const result = useQuery({
    queryKey: queryKeys.reviews.voters(reviewId),
    queryFn: () => ReviewService.getVoters(reviewId),
  });

  const title = vote === 1 ? "Upvoted by" : "Downvoted by";
  const voters = (result.data ?? []).filter((voter) => voter.vote === vote);

  return (
    <div className={styles.popup} role="dialog" aria-label={title}>
      <header className={styles.title}>
        {voters.length ? `${title} · ${voters.length}` : title}
      </header>

      {result.isPending ? (
        <span className={styles.message}>
          <Loader inline={true} />
        </span>
      ) : result.isError ? (
        <span className={styles.message}>Failed to load the voters.</span>
      ) : voters.length ? (
        <ul className={styles.list}>
          {voters.map((voter) => (
            <li className={styles.listItem} key={voter.user.id}>
              <UserLink className={styles.userLink} user={voter.user}>
                <UserPicture user={voter.user} />
                <span className={styles.username}>{voter.user.username}</span>
              </UserLink>
            </li>
          ))}
        </ul>
      ) : (
        <span className={styles.message}>Nobody yet.</span>
      )}
    </div>
  );
};

export { ReviewVotersPopup };

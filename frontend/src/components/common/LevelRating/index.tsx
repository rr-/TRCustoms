import styles from "./index.module.css";
import type { RatingClass } from "src/types";

interface LevelRatingProps {
  ratingClass: RatingClass | null;
}

const LevelRating = ({ ratingClass }: LevelRatingProps) => {
  if (!ratingClass) {
    return <>Not enough ratings</>;
  }
  let style = styles.neutral;
  if (ratingClass.position > 0) {
    style = styles.positive;
  } else if (ratingClass.position < 0) {
    style = styles.negative;
  }
  return <span className={style}>{ratingClass.name}</span>;
};

export { LevelRating };

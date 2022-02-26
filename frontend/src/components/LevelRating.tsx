import "./LevelRating.css";
import type { RatingClass } from "src/types";

interface LevelRatingProps {
  ratingClass: RatingClass | null;
}

const LevelRating = ({ ratingClass }: LevelRatingProps) => {
  if (!ratingClass) {
    return <>Not enough reviews</>;
  }
  let color: string = "neutral";
  if (ratingClass.position > 0) {
    color = "positive";
  } else if (ratingClass.position < 0) {
    color = "negative";
  }
  return <span className={`LevelRating ${color}`}>{ratingClass.name}</span>;
};

export { LevelRating };

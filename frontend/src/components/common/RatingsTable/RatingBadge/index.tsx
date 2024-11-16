import styles from "./index.module.css";
import { IconThumbUp } from "src/components/icons";
import { IconThumbDown } from "src/components/icons";
import { IconDotsCircleHorizontal } from "src/components/icons";
import type { RatingClass } from "src/types";

interface RatingBadgeProps {
  ratingClass: RatingClass;
}

const RatingBadge = ({ ratingClass }: RatingBadgeProps) => {
  const position = ratingClass.position || 0;

  const badges = [
    { style: styles.positive, icon: <IconThumbUp />, text: "Positive" },
    { style: styles.negative, icon: <IconThumbDown />, text: "Negative" },
    {
      style: styles.neutral,
      icon: <IconDotsCircleHorizontal />,
      text: "Neutral",
    },
  ];

  let badge;
  if (position > 0) {
    badge = badges[0];
  } else if (position < 0) {
    badge = badges[1];
  } else {
    badge = badges[2];
  }

  return (
    <span className={[styles.wrapper, badge.style].join(" ")}>
      {badge.icon}
      {badge.text}
    </span>
  );
};

export { RatingBadge };

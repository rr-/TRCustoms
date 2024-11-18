import styles from "./index.module.css";
import { IconThumbUp } from "src/components/icons";
import { IconThumbDown } from "src/components/icons";
import { IconDotsCircleHorizontal } from "src/components/icons";
import type { RatingClass } from "src/types";

interface RatingBadgeProps {
  isLegacy: boolean;
  ratingClass: RatingClass;
}

const RatingBadge = ({ isLegacy, ratingClass }: RatingBadgeProps) => {
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

  let text = badge.text;
  if (isLegacy) {
    text += " (Legacy)";
  }

  return (
    <span className={[styles.wrapper, badge.style].join(" ")}>
      {badge.icon}
      {text}
    </span>
  );
};

export { RatingBadge };

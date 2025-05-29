import styles from "./index.module.css";
import React from "react";
import { AwardService } from "src/services/AwardService";

export type AwardIconSize = "small" | "big";

export interface AwardIconProps {
  code: string;
  tier?: number;
  alt?: string;
  size?: AwardIconSize;
  className?: string;
}

export const AwardIcon: React.FC<AwardIconProps> = ({
  code,
  tier,
  alt,
  size = "small",
  className = "",
}) => {
  const src = AwardService.getArtifactImageSrc(code, tier);
  const classes = [styles.icon, styles[size], className]
    .filter(Boolean)
    .join(" ");
  return <img className={classes} src={src} alt={alt || code} />;
};

export default AwardIcon;

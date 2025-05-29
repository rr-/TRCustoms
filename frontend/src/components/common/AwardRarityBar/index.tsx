import styles from "./index.module.css";
import React from "react";
import { reprPercentage } from "src/utils/string";

export interface AwardRarityBarProps {
  userPercentage: number;
}

export const AwardRarityBar: React.FC<AwardRarityBarProps> = ({
  userPercentage,
}) => (
  <div className={styles.rarityBarContainer}>
    <div
      className={styles.rarityBarFill}
      style={{ width: `${userPercentage}%` }}
    />
    <span className={styles.rarityBarLabel}>
      {reprPercentage(userPercentage / 100, 2)} users got this award
    </span>
  </div>
);

export default AwardRarityBar;

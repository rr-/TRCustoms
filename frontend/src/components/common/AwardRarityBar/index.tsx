import styles from "./index.module.css";
import React from "react";
import { reprPercentage } from "src/utils/string";

export interface AwardRarityBarProps {
  rarity: number;
}

export const AwardRarityBar: React.FC<AwardRarityBarProps> = ({ rarity }) => (
  <div className={styles.rarityBarContainer}>
    <div
      className={styles.rarityBarFill}
      style={{ width: `${(1 - rarity) * 100}%` }}
    />
    <span className={styles.rarityBarLabel}>
      {reprPercentage(1 - rarity, 2)} users got this award
    </span>
  </div>
);

export default AwardRarityBar;

import styles from "./index.module.css";
import { useState } from "react";
import { useContext } from "react";
import { ConfigContext } from "src/contexts/ConfigContext";
import { reprBigNumber } from "src/utils/string";
import { reprPercentage } from "src/utils/string";

const WalkthroughStats = () => {
  const { config } = useContext(ConfigContext);
  const [tooltip, setTooltip] = useState<string | undefined>();

  const stats = [
    {
      title: "Video and text",
      className: styles.videoAndText,
      count: config.stats.walkthroughs.video_and_text,
    },
    {
      title: "Video only",
      className: styles.videoOnly,
      count: config.stats.walkthroughs.video,
    },
    {
      title: "Text only",
      className: styles.textOnly,
      count: config.stats.walkthroughs.text,
    },
    {
      title: "Missing",
      className: styles.none,
      count: config.stats.walkthroughs.none,
    },
  ];

  const maxLevelCount = Math.max(
    ...config.stats.reviews.map((item) => item.level_count)
  );

  const handleMouseEnter = (item: typeof stats[0]) => {
    setTooltip(
      `${item.title}: ${item.count} (${reprPercentage(
        item.count / config.stats.total_levels
      )})`
    );
  };

  const handleMouseLeave = (item: typeof stats[0]) => {
    setTooltip(undefined);
  };

  const defaultTooltip = (
    <>
      Walkthroughs: {reprBigNumber(config.stats.total_walkthroughs)} (
      {reprPercentage(
        (config.stats.walkthroughs.video_and_text +
          config.stats.walkthroughs.video +
          config.stats.walkthroughs.text) /
          config.stats.total_levels
      )}
      )
    </>
  );

  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        {stats.map((item) => (
          <li
            key={item.title}
            className={styles.listItem}
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={() => handleMouseLeave(item)}
            style={{
              width: `${(item.count * 100) / maxLevelCount}%`,
            }}
          >
            <div
              title={item.title}
              className={`${styles.indicator} ${item.className}`}
            ></div>
          </li>
        ))}
      </ul>
      <footer className={styles.footer}>{tooltip || defaultTooltip}</footer>
    </div>
  );
};

export { WalkthroughStats };

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
      count: config.walkthrough_stats.video_and_text,
    },
    {
      title: "Video only",
      className: styles.videoOnly,
      count: config.walkthrough_stats.video,
    },
    {
      title: "Text only",
      className: styles.textOnly,
      count: config.walkthrough_stats.text,
    },
    {
      title: "Missing",
      className: styles.none,
      count: config.walkthrough_stats.none,
    },
  ];

  const maxLevelCount = Math.max(
    ...config.review_stats.map((item) => item.level_count)
  );

  const handleMouseEnter = (item: typeof stats[0]) => {
    setTooltip(
      `${item.title}: ${item.count} (${reprPercentage(
        item.count / config.total_levels
      )})`
    );
  };

  const handleMouseLeave = (item: typeof stats[0]) => {
    setTooltip(undefined);
  };

  const defaultTooltip = (
    <>
      Walkthroughs: {reprBigNumber(config.total_walkthroughs)} (
      {reprPercentage(
        (config.walkthrough_stats.video_and_text +
          config.walkthrough_stats.video +
          config.walkthrough_stats.text) /
          config.total_levels
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

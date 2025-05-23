import styles from "./index.module.css";
import { sortBy } from "lodash";
import { useState } from "react";
import { useContext } from "react";
import { ConfigContext } from "src/contexts/ConfigContext";
import { reprBigNumber } from "src/utils/string";

const RatingStats = () => {
  const { config } = useContext(ConfigContext);
  const [tooltip, setTooltip] = useState<string | undefined>();

  const maxLevelCount = Math.max(
    ...config.stats.ratings.map((item) => item.level_count),
  );
  const maxRatingClassPosition = Math.max(
    ...config.stats.ratings.map((item) => item.rating_class.position),
  );

  const handleMouseEnter = (item: (typeof config.stats.ratings)[0]) => {
    setTooltip(`${item.rating_class.name}: ${item.level_count}`);
  };

  const handleMouseLeave = (item: (typeof config.stats.ratings)[0]) => {
    setTooltip(undefined);
  };

  const defaultTooltip = (
    <>
      Ratings: {reprBigNumber(config.stats.total_ratings)} (
      {reprBigNumber(config.stats.total_ratings / config.stats.total_levels)}{" "}
      per level)
    </>
  );

  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        {sortBy(config.stats.ratings, (item) => item.rating_class.position).map(
          (item) => (
            <li
              key={item.rating_class.name}
              className={styles.listItem}
              onMouseEnter={() => handleMouseEnter(item)}
              onMouseLeave={() => handleMouseLeave(item)}
            >
              <div
                data-rating-position={item.rating_class.position}
                title={item.rating_class.name}
                className={styles.indicator}
                style={{
                  height: `${(item.level_count * 100) / maxLevelCount}%`,
                }}
              >
                <div
                  className={`${styles.indicatorFill} ${
                    item.rating_class.position > 0
                      ? styles.positive
                      : styles.negative
                  }`}
                  style={{
                    opacity: `${
                      Math.abs(
                        item.rating_class.position / maxRatingClassPosition,
                      ) * 100
                    }%`,
                  }}
                />
              </div>
            </li>
          ),
        )}
      </ul>
      <footer className={styles.footer}>{tooltip || defaultTooltip}</footer>
    </div>
  );
};

export { RatingStats };

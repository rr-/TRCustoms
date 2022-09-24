import "./index.css";
import { sortBy } from "lodash";
import { useState } from "react";
import { useContext } from "react";
import { ConfigContext } from "src/contexts/ConfigContext";
import { reprBigNumber } from "src/utils/string";

const ReviewStats = () => {
  const { config } = useContext(ConfigContext);
  const [tooltip, setTooltip] = useState<string | undefined>();

  const maxLevelCount = Math.max(
    ...config.review_stats.map((item) => item.level_count)
  );
  const maxRatingClassPosition = Math.max(
    ...config.review_stats.map((item) => item.rating_class.position)
  );

  const handleMouseEnter = (item: typeof config.review_stats[0]) => {
    setTooltip(`${item.rating_class.name}: ${item.level_count}`);
  };

  const handleMouseLeave = (item: typeof config.review_stats[0]) => {
    setTooltip(undefined);
  };

  const defaultTooltip = (
    <>
      Reviews: {reprBigNumber(config.total_reviews)} (
      {reprBigNumber(config.total_reviews / config.total_levels)} per level)
    </>
  );

  return (
    <div className="ReviewStats">
      <ul className="ReviewStats--list">
        {sortBy(config.review_stats, (item) => item.rating_class.position).map(
          (item) => (
            <li
              key={item.rating_class.name}
              className="ReviewStats--listItem"
              onMouseEnter={() => handleMouseEnter(item)}
              onMouseLeave={() => handleMouseLeave(item)}
            >
              <div
                data-rating-position={item.rating_class.position}
                title={item.rating_class.name}
                className="ReviewStats--indicator"
                style={{
                  height: `${(item.level_count * 100) / maxLevelCount}%`,
                }}
              >
                <div
                  className={`ReviewStats--indicatorFill ${
                    item.rating_class.position > 0 ? "positive" : "negative"
                  }`}
                  style={{
                    opacity: `${
                      Math.abs(
                        item.rating_class.position / maxRatingClassPosition
                      ) * 100
                    }%`,
                  }}
                />
              </div>
            </li>
          )
        )}
      </ul>
      <footer className="ReviewStats--footer">
        {tooltip || defaultTooltip}
      </footer>
    </div>
  );
};

export { ReviewStats };

import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "src/components/common/Loader";
import { SpiderGraph } from "src/components/common/SpiderGraph";
import { LevelService } from "src/services/LevelService";
import { queryKeys } from "src/services/queryKeys";
import { titleCase } from "src/utils/string";

const MIN_RATING_COUNT = 3;

interface SpiderGraphProps {
  levelId: number;
}

const SpiderGraphWrapper = ({ levelId }: SpiderGraphProps) => {
  const result = useQuery({
    queryKey: queryKeys.levels.ratingStats(levelId),
    queryFn: () => LevelService.getRatingStats(levelId),
  });

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const data = result.data.categories.map((item) => ({
    name: titleCase(item.category),
    minValue: item.min_points,
    maxValue: item.max_points,
    value: item.total_points,
  }));

  return (
    <div>
      <div className={styles.wrapper}>
        {result.data.trc_rating_count < MIN_RATING_COUNT ? (
          result.data.trle_rating_count < MIN_RATING_COUNT ? (
            <p>Not enough ratings to display graph.</p>
          ) : (
            <p>Legacy ratings must be updated to display graph.</p>
          )
        ) : (
          <SpiderGraph data={data} />
        )}
      </div>
      <hr />
    </div>
  );
};

export { SpiderGraphWrapper };

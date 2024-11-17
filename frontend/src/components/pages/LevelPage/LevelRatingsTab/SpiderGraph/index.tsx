import styles from "./index.module.css";
import { useQuery } from "react-query";
import { Loader } from "src/components/common/Loader";
import { SpiderGraph } from "src/components/common/SpiderGraph";
import type { CategoryRating } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { titleCase } from "src/utils/string";

interface SpiderGraphProps {
  levelId: number;
}

const SpiderGraphWrapper = ({ levelId }: SpiderGraphProps) => {
  const result = useQuery<CategoryRating[], Error>(
    [
      "levelCategoryRatings",
      RatingService.getCategoryRatingsByLevelId,
      levelId,
    ],
    async () => RatingService.getCategoryRatingsByLevelId(+levelId)
  );

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const data = result.data.map((item) => ({
    name: titleCase(item.category),
    minValue: item.min_points,
    maxValue: item.max_points,
    value: item.total_points,
  }));

  if (data.every((item) => item.value === 0)) {
    return null;
  }

  return (
    <div>
      <div className={styles.wrapper}>
        <SpiderGraph data={data} />
      </div>
      <hr />
    </div>
  );
};

export { SpiderGraphWrapper };

import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { useConfig } from "src/stores/config";
import type { RatingClass } from "src/types";

interface RatingsCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const RatingsCheckboxes = ({ value, onChange }: RatingsCheckboxesProps) => {
  const { config } = useConfig();

  return (
    <EntitiesCheckboxes
      entitiesPool={config.stats.ratings.map((stat) => stat.rating_class)}
      value={value}
      onChange={onChange}
      getEntityId={(entity: RatingClass) => entity.id}
      getEntityName={(entity: RatingClass) => entity.name}
      getEntitySortPosition={(entity: RatingClass) => -(entity.position ?? 0)}
    />
  );
};

export { RatingsCheckboxes };

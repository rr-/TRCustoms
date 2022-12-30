import { useContext } from "react";
import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { RatingClass } from "src/types";

interface RatingsCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const RatingsCheckboxes = ({ value, onChange }: RatingsCheckboxesProps) => {
  const { config } = useContext(ConfigContext);

  return (
    <EntitiesCheckboxes
      entitiesPool={config.review_stats.map((stat) => stat.rating_class)}
      value={value}
      onChange={onChange}
      getEntityId={(entity: RatingClass) => entity.id}
      getEntityName={(entity: RatingClass) => entity.name}
      getEntitySortPosition={(entity: RatingClass) => entity.position}
    />
  );
};

export { RatingsCheckboxes };

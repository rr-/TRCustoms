import { useContext } from "react";
import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { DifficultyListing } from "src/services/ConfigService";

interface DifficultiesCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const DifficultiesCheckboxes = ({
  value,
  onChange,
}: DifficultiesCheckboxesProps) => {
  const { config } = useContext(ConfigContext);

  return (
    <EntitiesCheckboxes
      header="Difficulties"
      entitiesPool={config.difficulties}
      value={value}
      onChange={onChange}
      getEntityId={(entity: DifficultyListing) => entity.id}
      getEntityName={(entity: DifficultyListing) => entity.name}
      getEntitySortPosition={(entity: DifficultyListing) => entity.position}
    />
  );
};

export { DifficultiesCheckboxes };

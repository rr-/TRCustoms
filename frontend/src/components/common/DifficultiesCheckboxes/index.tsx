import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import type { DifficultyListing } from "src/services/ConfigService";
import { useConfig } from "src/stores/config";

interface DifficultiesCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const DifficultiesCheckboxes = ({
  value,
  onChange,
}: DifficultiesCheckboxesProps) => {
  const { config } = useConfig();

  return (
    <EntitiesCheckboxes
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

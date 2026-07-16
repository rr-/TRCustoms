import type { EngineListing } from "src/client";
import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { useConfig } from "src/stores/config";

interface EnginesCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const EnginesCheckboxes = ({ value, onChange }: EnginesCheckboxesProps) => {
  const { config } = useConfig();

  return (
    <EntitiesCheckboxes
      entitiesPool={config.engines}
      value={value}
      onChange={onChange}
      getEntityId={(entity: EngineListing) => entity.id}
      getEntityName={(entity: EngineListing) => entity.name}
      getEntitySortPosition={(entity: EngineListing) => entity.position}
    />
  );
};

export { EnginesCheckboxes };

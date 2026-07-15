import { useContext } from "react";
import type { EngineListing } from "src/client";
import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { ConfigContext } from "src/contexts/ConfigContext";

interface EnginesCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const EnginesCheckboxes = ({ value, onChange }: EnginesCheckboxesProps) => {
  const { config } = useContext(ConfigContext);

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

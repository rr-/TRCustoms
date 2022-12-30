import { useContext } from "react";
import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { EngineListing } from "src/services/EngineService";

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
    />
  );
};

export { EnginesCheckboxes };

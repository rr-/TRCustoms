import { useContext } from "react";
import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { DurationListing } from "src/services/ConfigService";

interface DurationsCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const DurationsCheckboxes = ({ value, onChange }: DurationsCheckboxesProps) => {
  const { config } = useContext(ConfigContext);

  return (
    <EntitiesCheckboxes
      header="Durations"
      entitiesPool={config.durations}
      value={value}
      onChange={onChange}
      getEntityId={(entity: DurationListing) => entity.id}
      getEntityName={(entity: DurationListing) => entity.name}
      getEntitySortPosition={(entity: DurationListing) => entity.position}
    />
  );
};

export { DurationsCheckboxes };

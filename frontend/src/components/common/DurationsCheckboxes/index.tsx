import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import type { DurationListing } from "src/services/ConfigService";
import { useConfig } from "src/stores/config";

interface DurationsCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const DurationsCheckboxes = ({ value, onChange }: DurationsCheckboxesProps) => {
  const { config } = useConfig();

  return (
    <EntitiesCheckboxes
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

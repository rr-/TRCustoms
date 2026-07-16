import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import type { GenreListing } from "src/services/GenreService";
import { useConfig } from "src/stores/config";

interface GenresCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const GenresCheckboxes = ({ value, onChange }: GenresCheckboxesProps) => {
  const { config } = useConfig();

  return (
    <EntitiesCheckboxes
      entitiesPool={config.genres}
      maxVisibleEntities={8}
      value={value}
      onChange={onChange}
      getEntityId={(entity: GenreListing) => entity.id}
      getEntityName={(entity: GenreListing) => entity.name}
    />
  );
};

export { GenresCheckboxes };

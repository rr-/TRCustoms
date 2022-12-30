import { useContext } from "react";
import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { GenreListing } from "src/services/GenreService";

interface GenresCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const GenresCheckboxes = ({ value, onChange }: GenresCheckboxesProps) => {
  const { config } = useContext(ConfigContext);

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

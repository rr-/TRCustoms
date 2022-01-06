import { useContext } from "react";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import { LevelFiltersContext } from "src/shared/contexts/LevelFiltersContext";

const GenresCheckboxes = () => {
  const { levelFilters } = useContext(LevelFiltersContext);
  return (
    <CheckboxArrayFormField
      label="Genres"
      name="genres"
      source={
        levelFilters
          ? levelFilters.genres.map((genre) => ({
              value: genre.id,
              label: genre.name,
            }))
          : []
      }
    />
  );
};

export default GenresCheckboxes;

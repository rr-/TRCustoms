import { useContext } from "react";
import { CheckboxArrayFormField } from "src/shared/components/CheckboxArrayFormField";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

const GenresCheckboxes = () => {
  const config = useContext(ConfigContext);
  const source: { value: number; label: string }[] = config.genres.map(
    (genre) => ({
      value: genre.id,
      label: genre.name,
    })
  );
  return (
    <CheckboxArrayFormField label="Genres" name="genres" source={source} />
  );
};

export { GenresCheckboxes };

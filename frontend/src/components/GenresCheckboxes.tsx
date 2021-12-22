import { useQuery } from "react-query";
import type { LevelFilters } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import Loader from "src/shared/components/Loader";

const GenresCheckboxes = () => {
  const query = {};
  const result = useQuery<LevelFilters, Error>(
    ["levelFilters", query],
    async () => LevelService.getLevelFilters(query)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  return (
    <CheckboxArrayFormField
      label="Genres"
      name="genres"
      source={result.data.genres.map((genre) => ({
        value: genre.id,
        label: genre.name,
      }))}
    />
  );
};

export default GenresCheckboxes;

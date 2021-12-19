import { useQuery } from "react-query";
import { ILevelFilters } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import Loader from "src/shared/components/Loader";

const GenresCheckboxes: React.FunctionComponent = () => {
  const query = {};
  const levelFiltersQuery = useQuery<ILevelFilters, Error>(
    ["levelFilters", query],
    async () => LevelService.getLevelFilters(query)
  );

  if (levelFiltersQuery.error) {
    return <p>{levelFiltersQuery.error.message}</p>;
  }

  if (levelFiltersQuery.isLoading || !levelFiltersQuery.data) {
    return <Loader />;
  }

  return (
    <CheckboxArrayFormField
      label="Genres"
      name="genres"
      source={levelFiltersQuery.data.genres.map((genre) => ({
        value: genre.id,
        label: genre.name,
      }))}
    />
  );
};

export default GenresCheckboxes;

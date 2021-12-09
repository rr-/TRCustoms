import { useQuery } from "react-query";
import { ILevelGenreList } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import Loader from "src/shared/components/Loader";

const LevelGenresCheckboxes: React.FunctionComponent = () => {
  const levelGenresQuery = useQuery<ILevelGenreList, Error>(
    "levelGenres",
    LevelService.getLevelGenres
  );

  if (levelGenresQuery.isLoading) {
    return <Loader />;
  }

  if (levelGenresQuery.error) {
    return <p>{levelGenresQuery.error.message}</p>;
  }

  return (
    <CheckboxArrayFormField
      label="Genres"
      name="genres"
      source={levelGenresQuery.data.map((genre) => ({
        value: genre.id,
        label: genre.name,
      }))}
    />
  );
};

export default LevelGenresCheckboxes;

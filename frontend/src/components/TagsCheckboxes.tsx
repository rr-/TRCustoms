import { useQuery } from "react-query";
import { ILevelFilters } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import Loader from "src/shared/components/Loader";

const TagsCheckboxes: React.FunctionComponent = () => {
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
      label="Tags"
      name="tags"
      source={levelFiltersQuery.data.tags.map((tag) => ({
        value: tag.id,
        label: tag.name,
      }))}
    />
  );
};

export default TagsCheckboxes;

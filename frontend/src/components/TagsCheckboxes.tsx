import { useQuery } from "react-query";
import type { LevelFilters } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import Loader from "src/shared/components/Loader";

const TagsCheckboxes = () => {
  const query = {};
  const result = useQuery<LevelFilters, Error>(
    [LevelService.getLevelFilters, query],
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
      label="Tags"
      name="tags"
      source={result.data.tags.map((tag) => ({
        value: tag.id,
        label: tag.name,
      }))}
    />
  );
};

export default TagsCheckboxes;

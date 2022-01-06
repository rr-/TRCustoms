import { useContext } from "react";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import { LevelFiltersContext } from "src/shared/contexts/LevelFiltersContext";

const TagsCheckboxes = () => {
  const { levelFilters } = useContext(LevelFiltersContext);
  return (
    <CheckboxArrayFormField
      label="Tags"
      name="tags"
      source={
        levelFilters
          ? levelFilters.tags.map((tag) => ({
              value: tag.id,
              label: tag.name,
            }))
          : []
      }
    />
  );
};

export default TagsCheckboxes;

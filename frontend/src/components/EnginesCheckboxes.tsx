import { useContext } from "react";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import { LevelFiltersContext } from "src/shared/contexts/LevelFiltersContext";

const EnginesCheckboxes = () => {
  const { levelFilters } = useContext(LevelFiltersContext);
  return (
    <CheckboxArrayFormField
      label="Engines"
      name="engines"
      source={
        levelFilters
          ? levelFilters.engines.map((engine) => ({
              value: engine.id,
              label: engine.name,
            }))
          : []
      }
    />
  );
};

export default EnginesCheckboxes;

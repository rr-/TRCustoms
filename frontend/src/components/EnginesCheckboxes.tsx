import { useQuery } from "react-query";
import type { LevelFilters } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import Loader from "src/shared/components/Loader";

const EnginesCheckboxes = () => {
  const query = {};
  const levelFiltersQuery = useQuery<LevelFilters, Error>(
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
      label="Engines"
      name="engines"
      source={levelFiltersQuery.data.engines.map((engine) => ({
        value: engine.id,
        label: engine.name,
      }))}
    />
  );
};

export default EnginesCheckboxes;

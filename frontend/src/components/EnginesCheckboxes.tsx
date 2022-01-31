import { sortBy } from "lodash";
import { useContext } from "react";
import { FilterCheckboxesHeader } from "src/components/FilterCheckboxesHeader";
import type { EngineNested } from "src/services/engine.service";
import type { LevelSearchQuery } from "src/services/level.service";
import { Checkbox } from "src/shared/components/Checkbox";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

interface EnginesCheckboxesProps {
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => any;
}

const EnginesCheckboxes = ({
  searchQuery,
  onSearchQueryChange,
}: EnginesCheckboxesProps) => {
  const { config } = useContext(ConfigContext);
  const visibleEngines = sortBy(config.engines, (engine) => engine.name);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    engine: EngineNested
  ) => {
    onSearchQueryChange({
      ...searchQuery,
      engines: event.target.checked
        ? [...searchQuery.engines, engine.id]
        : searchQuery.engines.filter((tagId) => tagId !== engine.id),
    });
  };

  const handleClear = () => {
    onSearchQueryChange({ ...searchQuery, engines: [] });
  };

  return (
    <div className="EnginesCheckboxes">
      <FilterCheckboxesHeader onClear={handleClear}>
        Engines:
      </FilterCheckboxesHeader>
      {visibleEngines.map((engine) => (
        <div key={engine.id}>
          <Checkbox
            label={engine.name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(event, engine)
            }
            checked={searchQuery.engines.includes(engine.id)}
          />
        </div>
      ))}
    </div>
  );
};

export { EnginesCheckboxes };

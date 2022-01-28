import { sortBy } from "lodash";
import { useContext } from "react";
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

  const onChange = (
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

  return (
    <div className="EnginesCheckboxes">
      <p>Engines:</p>
      {visibleEngines.map((engine) => (
        <div>
          <Checkbox
            label={engine.name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onChange(event, engine)
            }
            checked={searchQuery.engines.includes(engine.id)}
          />
        </div>
      ))}
    </div>
  );
};

export { EnginesCheckboxes };

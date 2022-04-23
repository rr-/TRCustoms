import { useContext } from "react";
import { Checkbox } from "src/components/Checkbox";
import { FilterCheckboxesHeader } from "src/components/FilterCheckboxesHeader";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { EngineNested } from "src/services/EngineService";

interface EnginesCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const EnginesCheckboxes = ({ value, onChange }: EnginesCheckboxesProps) => {
  const { config } = useContext(ConfigContext);
  const visibleEngines = config.engines;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    engine: EngineNested
  ) => {
    onChange(
      event.target.checked
        ? [...value, engine.id]
        : value.filter((tagId) => tagId !== engine.id)
    );
  };

  const handleClear = () => {
    onChange([]);
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
            checked={value.includes(engine.id)}
          />
        </div>
      ))}
    </div>
  );
};

export { EnginesCheckboxes };

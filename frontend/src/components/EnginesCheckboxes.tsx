import { useContext } from "react";
import { CheckboxArrayFormField } from "src/shared/components/CheckboxArrayFormField";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

const EnginesCheckboxes = () => {
  const config = useContext(ConfigContext);
  const source: { value: number; label: string }[] = config.engines.map(
    (engine) => ({
      value: engine.id,
      label: engine.name,
    })
  );
  return (
    <CheckboxArrayFormField label="Engines" name="engines" source={source} />
  );
};

export { EnginesCheckboxes };

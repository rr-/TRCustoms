import { DropDownField } from "src/components/forms/fields/DropDownField";
import type { DropDownFieldProps } from "src/components/forms/fields/DropDownField";
import { useConfig } from "src/stores/config";

// react-hook-form port of EngineFormField: a dropdown of the configured engines.
const EngineField = (props: Omit<DropDownFieldProps, "options">) => {
  const { config } = useConfig();
  const options = config.engines.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  return <DropDownField {...props} options={options} />;
};

export { EngineField };

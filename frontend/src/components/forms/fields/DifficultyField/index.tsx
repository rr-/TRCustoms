import { DropDownField } from "src/components/forms/fields/DropDownField";
import type { DropDownFieldProps } from "src/components/forms/fields/DropDownField";
import { useConfig } from "src/stores/config";

// react-hook-form port of DifficultyFormField.
const DifficultyField = (props: Omit<DropDownFieldProps, "options">) => {
  const { config } = useConfig();
  const options = config.difficulties.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  return <DropDownField {...props} options={options} />;
};

export { DifficultyField };

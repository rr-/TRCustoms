import { DropDownField } from "src/components/forms/fields/DropDownField";
import type { DropDownFieldProps } from "src/components/forms/fields/DropDownField";
import { useConfig } from "src/stores/config";

// react-hook-form port of DurationFormField.
const DurationField = (props: Omit<DropDownFieldProps, "options">) => {
  const { config } = useConfig();
  const options = config.durations.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  return <DropDownField {...props} options={options} />;
};

export { DurationField };

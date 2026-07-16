import { useContext } from "react";
import { DropDownField } from "src/components/forms/DropDownField";
import type { DropDownFieldProps } from "src/components/forms/DropDownField";
import { ConfigContext } from "src/contexts/ConfigContext";

// react-hook-form port of DifficultyFormField.
const DifficultyField = (props: Omit<DropDownFieldProps, "options">) => {
  const { config } = useContext(ConfigContext);
  const options = config.difficulties.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  return <DropDownField {...props} options={options} />;
};

export { DifficultyField };

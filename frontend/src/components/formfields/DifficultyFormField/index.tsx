import { useContext } from "react";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { DropDownFormField } from "src/components/formfields/DropDownFormField";
import { ConfigContext } from "src/contexts/ConfigContext";

const DifficultyFormField = (props: GenericFormFieldProps) => {
  const { config } = useContext(ConfigContext);
  const options = config.difficulties.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  return <DropDownFormField {...props} options={options} />;
};

export { DifficultyFormField };

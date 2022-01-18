import { useContext } from "react";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";
import { DropDownFormField } from "src/shared/components/formfields/DropDownFormField";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

const DurationFormField = (props: GenericFormFieldProps) => {
  const { config } = useContext(ConfigContext);
  const options = config.durations.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  return <DropDownFormField {...props} options={options} />;
};

export { DurationFormField };

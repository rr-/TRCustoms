import { useController } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Radiobox } from "src/components/common/Radiobox";
import { BaseField } from "src/components/forms/BaseField";
import type { BaseFieldProps } from "src/components/forms/BaseField";

interface RadioOption {
  label: React.ReactNode;
  value: number;
}

interface RadioFieldProps extends Omit<BaseFieldProps, "children"> {
  options: RadioOption[];
}

// Self-binding radio group. Stores the selected option's numeric value on the
// form, mirroring CheckboxField's useController pattern.
const RadioField = ({ name, options, ...baseProps }: RadioFieldProps) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  return (
    <BaseField name={name} {...baseProps}>
      {options.map((option) => (
        <div key={option.value}>
          <Radiobox
            label={option.label}
            checked={field.value === option.value}
            onChange={() => field.onChange(option.value)}
          />
        </div>
      ))}
    </BaseField>
  );
};

export type { RadioOption };
export { RadioField };

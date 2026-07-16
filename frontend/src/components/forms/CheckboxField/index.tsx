import { useController } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "src/components/common/Checkbox";
import { BaseField } from "src/components/forms/BaseField";
import type { BaseFieldProps } from "src/components/forms/BaseField";

interface CheckboxFieldProps extends Omit<BaseFieldProps, "children"> {
  readonly?: boolean | undefined;
  onChange?: ((checked: boolean) => void) | undefined;
}

// react-hook-form port of CheckboxFormField. The label sits on the checkbox
// itself (not the field label), matching the original.
const CheckboxField = ({
  name,
  label,
  readonly,
  onChange,
  ...baseProps
}: CheckboxFieldProps) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  return (
    <BaseField name={name} {...baseProps}>
      <Checkbox
        disabled={readonly}
        label={label}
        checked={!!field.value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          field.onChange(event.target.checked);
          onChange?.(event.target.checked);
        }}
      />
    </BaseField>
  );
};

export { CheckboxField };

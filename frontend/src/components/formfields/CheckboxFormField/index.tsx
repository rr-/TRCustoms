import { useFormikContext } from "formik";
import { Checkbox } from "src/components/common/Checkbox";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";

interface CheckboxFormFieldProps extends GenericFormFieldProps {
  onChange?: (checked: boolean) => void | undefined;
}

const CheckboxFormField = ({
  name,
  label,
  readonly,
  onChange,
  ...props
}: CheckboxFormFieldProps) => {
  const { values, setFieldValue } = useFormikContext() as {
    values: { [key: string]: any };
    setFieldValue: (name: string, value: any) => void;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, event.target.checked);
    onChange?.(event.target.checked);
  };

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <Checkbox
        disabled={readonly}
        label={label}
        onChange={handleChange}
        checked={values[name]}
      />
    </BaseFormField>
  );
};

export { CheckboxFormField };

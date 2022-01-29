import { Field } from "formik";
import { useFormikContext } from "formik";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";

interface CheckboxFormFieldProps extends GenericFormFieldProps {
  onChange?: () => void | undefined;
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
    onChange?.();
  };

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <label className="Checkbox--label">
        <Field
          disabled={readonly}
          type="checkbox"
          className="Checkbox--input"
          onChange={handleChange}
          checked={values[name]}
        />
        {label}
      </label>
    </BaseFormField>
  );
};

export { CheckboxFormField };

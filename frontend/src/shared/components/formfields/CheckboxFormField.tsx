import { Field } from "formik";
import { useFormikContext } from "formik";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";

const CheckboxFormField = ({
  name,
  label,
  readonly,
  ...props
}: GenericFormFieldProps) => {
  const { values, setFieldValue } = useFormikContext() as {
    values: { [key: string]: any };
    setFieldValue: (name: string, value: any) => void;
  };

  return (
    <BaseFormField name={name} readonly={readonly} label={null} {...props}>
      <label>
        <Field
          disabled={readonly}
          type="checkbox"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFieldValue(name, event.target.checked);
          }}
          checked={values[name]}
        />
        {label}
      </label>
    </BaseFormField>
  );
};

export { CheckboxFormField };

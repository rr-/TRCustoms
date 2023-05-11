import { useFormikContext } from "formik";
import { at } from "lodash";
import { Radiobox } from "src/components/common/Radiobox";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";

interface RadioboxFormFieldProps extends GenericFormFieldProps {
  id: any;
  onChange?: (checked: boolean) => void | undefined;
}

const RadioboxFormField = ({
  name,
  id,
  label,
  readonly,
  onChange,
  ...props
}: RadioboxFormFieldProps) => {
  const { values, setFieldValue } = useFormikContext() as {
    values: { [key: string]: any };
    setFieldValue: (name: string, value: any) => void;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, event.target.checked);
    onChange?.(event.target.checked);
  };

  const checked = at(values, name)?.includes(id);

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <Radiobox
        disabled={readonly}
        label={label}
        onChange={handleChange}
        checked={checked}
      />
    </BaseFormField>
  );
};

export { RadioboxFormField };

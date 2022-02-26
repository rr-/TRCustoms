import "./DropDownFormField.css";
import { Field } from "formik";
import { useFormikContext } from "formik";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";

interface DropDownOption {
  value: string | number;
  label: string;
}

interface DropDownFormFieldProps extends GenericFormFieldProps {
  options: DropDownOption[];
  onChange?: () => void | undefined;
  allowNull?: boolean | undefined;
  multiple?: boolean | undefined;
}

const DropDownFormField = ({
  name,
  options,
  onChange,
  multiple,
  allowNull,
  readonly,
  ...props
}: DropDownFormFieldProps) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(
      name,
      multiple
        ? [].slice
            .call(event.target.selectedOptions)
            .map((option: HTMLOptionElement) => option.value)
        : event.target.selectedOptions?.[0].value
    );
    onChange?.();
  };

  if (allowNull === undefined) {
    allowNull = false;
  }

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <Field
        as="select"
        name={name}
        disabled={readonly}
        placeholder="Select a value…"
        multiple={multiple}
        className="DropDownFormField--select"
        defaultValue={"-"}
        onChange={handleChange}
      >
        {!multiple && (
          <option disabled={!allowNull} value={"-"}>
            Select an option…
          </option>
        )}
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Field>
    </BaseFormField>
  );
};

export type { DropDownOption, DropDownFormFieldProps };
export { DropDownFormField };

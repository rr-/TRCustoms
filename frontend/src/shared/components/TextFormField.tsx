import "./TextFormField.css";
import { Field } from "formik";
import { BaseFormField } from "src/shared/components/BaseFormField";
import type { GenericFormFieldProps } from "src/shared/components/BaseFormField";

interface TextFormFieldProps extends GenericFormFieldProps {
  type?: string;
}

const TextFormField = ({
  name,
  readonly,
  type,
  ...props
}: TextFormFieldProps) => {
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <Field
        disabled={readonly}
        className="TextFormField--input"
        type={type || "text"}
        name={name}
      />
    </BaseFormField>
  );
};

export { TextFormField };

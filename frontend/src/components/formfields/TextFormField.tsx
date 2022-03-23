import { Field } from "formik";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";

interface TextFormFieldProps extends GenericFormFieldProps {
  type?: string | undefined;
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
        className="TextFormField--input Input"
        type={type || "text"}
        name={name}
      />
    </BaseFormField>
  );
};

export { TextFormField };

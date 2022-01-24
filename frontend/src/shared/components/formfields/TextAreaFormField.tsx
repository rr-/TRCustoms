import "./TextAreaFormField.css";
import { Field } from "formik";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";

interface TextAreaFormFieldProps extends GenericFormFieldProps {
  validate?: (value: string) => string | null;
}

const TextAreaFormField = ({
  name,
  readonly,
  validate,
  ...props
}: TextAreaFormFieldProps) => {
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <Field
        validate={validate}
        disabled={readonly}
        className="TextAreaFormField--textarea"
        as="textarea"
        type="text"
        name={name}
      />
    </BaseFormField>
  );
};

export { TextAreaFormField };

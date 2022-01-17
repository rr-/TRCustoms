import "./TextAreaFormField.css";
import { Field } from "formik";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";

const TextAreaFormField = ({
  name,
  readonly,
  ...props
}: GenericFormFieldProps) => {
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <Field
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

import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface TextAreaFormFieldProps {
  name: string;
  label: string;
  required?: boolean;
}

const TextAreaFormField = ({
  name,
  label,
  required,
}: TextAreaFormFieldProps) => {
  return (
    <BaseFormField required={required} name={name} label={label}>
      <Field as="textarea" type="text" name={name} />
    </BaseFormField>
  );
};

export default TextAreaFormField;

import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface TextFormFieldProps {
  name: string;
  label: string;
  required?: boolean;
}

const TextFormField = ({ name, label, required }: TextFormFieldProps) => {
  return (
    <BaseFormField required={required} name={name} label={label}>
      <Field type="text" name={name} />
    </BaseFormField>
  );
};

export default TextFormField;

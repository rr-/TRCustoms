import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface PasswordFormFieldProps {
  name: string;
  label: string;
  required?: boolean;
}

const PasswordFormField = ({
  name,
  label,
  required,
}: PasswordFormFieldProps) => {
  return (
    <BaseFormField required={required} label={label} name={name}>
      <Field type="password" name={name} />
    </BaseFormField>
  );
};

export default PasswordFormField;

import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface EmailFormFieldProps {
  name: string;
  label: string;
  required?: boolean;
}

const EmailFormField = ({ name, label, required }: EmailFormFieldProps) => {
  return (
    <BaseFormField required={required} name={name} label={label}>
      <Field type="email" name={name} />
    </BaseFormField>
  );
};

export default EmailFormField;

import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface IEmailFormField {
  name: string;
  label: string;
  required?: boolean;
}

const EmailFormField: React.FunctionComponent<IEmailFormField> = ({
  name,
  label,
  required,
}) => {
  return (
    <BaseFormField required={required} name={name} label={label}>
      <Field type="email" name={name} />
    </BaseFormField>
  );
};

export default EmailFormField;

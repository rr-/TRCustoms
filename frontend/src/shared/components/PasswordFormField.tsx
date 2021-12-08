import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface IPasswordFormField {
  name: string;
  label: string;
  required?: boolean;
}

const PasswordFormField: React.FunctionComponent<IPasswordFormField> = ({
  name,
  label,
  required,
}) => {
  return (
    <BaseFormField required={required} label={label} name={name}>
      <Field type="password" name={name} />
    </BaseFormField>
  );
};

export default PasswordFormField;

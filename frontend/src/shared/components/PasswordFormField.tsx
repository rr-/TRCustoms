import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface IPasswordFormField {
  name: string;
  label: string;
}

const PasswordFormField: React.FunctionComponent<IPasswordFormField> = ({
  name,
  label,
}) => {
  return (
    <BaseFormField label={label} name={name}>
      <Field type="password" name={name} />
    </BaseFormField>
  );
};

export default PasswordFormField;

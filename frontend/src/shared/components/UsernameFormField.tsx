import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface IUsernameFormField {
  name: string;
  label: string;
}

const UsernameFormField: React.FunctionComponent<IUsernameFormField> = ({
  name,
  label,
}) => {
  return (
    <BaseFormField
      name={name}
      label={label}
      render={() => <Field type="text" name={name} />}
    />
  );
};

export default UsernameFormField;

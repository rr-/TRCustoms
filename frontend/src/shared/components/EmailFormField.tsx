import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface IEmailFormField {
  name: string;
  label: string;
}

const EmailFormField: React.FunctionComponent<IEmailFormField> = ({
  name,
  label,
}) => {
  return (
    <BaseFormField
      name={name}
      label={label}
      render={() => <Field type="email" name={name} />}
    />
  );
};

export default EmailFormField;

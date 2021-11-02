import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface ITextFormField {
  name: string;
  label: string;
}

const TextFormField: React.FunctionComponent<ITextFormField> = ({
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

export default TextFormField;

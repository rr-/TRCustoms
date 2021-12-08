import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface ITextFormField {
  name: string;
  label: string;
  required?: boolean;
}

const TextFormField: React.FunctionComponent<ITextFormField> = ({
  name,
  label,
  required,
}) => {
  return (
    <BaseFormField required={required} name={name} label={label}>
      <Field type="text" name={name} />
    </BaseFormField>
  );
};

export default TextFormField;

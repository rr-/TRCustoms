import { Field } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface ITextAreaFormField {
  name: string;
  label: string;
}

const TextAreaFormField: React.FunctionComponent<ITextAreaFormField> = ({
  name,
  label,
}) => {
  return (
    <BaseFormField
      name={name}
      label={label}
      render={() => <Field as="textarea" type="text" name={name} />}
    />
  );
};

export default TextAreaFormField;

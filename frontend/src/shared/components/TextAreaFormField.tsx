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
    <BaseFormField name={name} label={label}>
      <Field as="textarea" type="text" name={name} />
    </BaseFormField>
  );
};

export default TextAreaFormField;

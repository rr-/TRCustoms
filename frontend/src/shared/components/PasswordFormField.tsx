import type { GenericFormFieldProps } from "src/shared/components/BaseFormField";
import TextFormField from "src/shared/components/TextFormField";

const PasswordFormField = (props: GenericFormFieldProps) => {
  return <TextFormField {...props} type="password" />;
};

export default PasswordFormField;

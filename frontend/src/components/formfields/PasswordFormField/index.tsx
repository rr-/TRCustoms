import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { TextFormField } from "src/components/formfields/TextFormField";

const PasswordFormField = (props: GenericFormFieldProps) => {
  return <TextFormField {...props} type="password" />;
};

export { PasswordFormField };

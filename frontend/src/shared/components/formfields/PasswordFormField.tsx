import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";
import { TextFormField } from "src/shared/components/formfields/TextFormField";

const PasswordFormField = (props: GenericFormFieldProps) => {
  return <TextFormField {...props} type="password" />;
};

export { PasswordFormField };

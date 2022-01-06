import type { GenericFormFieldProps } from "src/shared/components/BaseFormField";
import TextFormField from "src/shared/components/TextFormField";

const EmailFormField = (props: GenericFormFieldProps) => {
  return <TextFormField {...props} type="email" />;
};

export default EmailFormField;

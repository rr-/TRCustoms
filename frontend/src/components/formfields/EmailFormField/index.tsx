import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { TextFormField } from "src/components/formfields/TextFormField";

const EmailFormField = (props: GenericFormFieldProps) => {
  return <TextFormField {...props} type="email" />;
};

export { EmailFormField };

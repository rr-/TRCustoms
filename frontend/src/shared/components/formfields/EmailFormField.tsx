import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";
import { TextFormField } from "src/shared/components/formfields/TextFormField";

const EmailFormField = (props: GenericFormFieldProps) => {
  return <TextFormField {...props} type="email" />;
};

export { EmailFormField };

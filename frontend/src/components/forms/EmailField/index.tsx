import { TextField } from "src/components/forms/TextField";
import type { TextFieldProps } from "src/components/forms/TextField";

// react-hook-form port of EmailFormField: a TextField with an email input type.
const EmailField = (props: Omit<TextFieldProps, "type">) => (
  <TextField {...props} type="email" />
);

export { EmailField };

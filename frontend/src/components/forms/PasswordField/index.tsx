import { TextField } from "src/components/forms/TextField";
import type { TextFieldProps } from "src/components/forms/TextField";

// react-hook-form port of PasswordFormField: a TextField with a password input.
const PasswordField = (props: Omit<TextFieldProps, "type">) => (
  <TextField {...props} type="password" />
);

export { PasswordField };

import { ErrorMessage } from "formik";

interface FormFieldErrorProps {
  name: string;
}

const FormFieldError = ({ name }: FormFieldErrorProps) => (
  <ErrorMessage name={name}>
    {(msg: any) => <div className="FormFieldError">{msg}</div>}
  </ErrorMessage>
);

export { FormFieldError };

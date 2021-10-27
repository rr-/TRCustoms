import { ErrorMessage } from "formik";

interface IFormFieldError {
  name: string;
}

const FormFieldError: React.FunctionComponent<IFormFieldError> = ({ name }) => (
  <ErrorMessage name={name}>
    {(msg) => <div className="FormFieldError">{msg}</div>}
  </ErrorMessage>
);

export default FormFieldError;

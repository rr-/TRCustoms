import { Formik, Form } from "formik";
import { History } from "history";
import { useContext } from "react";
import { AuthService } from "src/services/auth.service";
import { UserService } from "src/services/user.service";
import { FetchError } from "src/shared/client";
import EmailFormField from "src/shared/components/EmailFormField";
import PasswordFormField from "src/shared/components/PasswordFormField";
import UsernameFormField from "src/shared/components/UsernameFormField";
import { UserContext } from "src/shared/contexts/UserContext";
import { makeSentence } from "src/shared/utils";
import { validateUserName } from "src/shared/utils";
import { validatePassword, validateEmail } from "src/shared/utils";

interface IRegister {
  history: History;
}

const Register: React.FunctionComponent<IRegister> = ({ history }) => {
  const { setUser } = useContext(UserContext);

  return (
    <div className="RegisterForm">
      <h1>Register</h1>
      <Formik
        initialValues={{ username: "", email: "", password: "", password2: "" }}
        validate={(values) => {
          const errors: {
            username?: string;
            email?: string;
            password?: string;
            password2?: string;
          } = {};

          let error;

          if ((error = validateUserName(values.username))) {
            errors.username = error;
          }

          if ((error = validateEmail(values.email))) {
            errors.email = error;
          }

          if ((error = validatePassword(values.password))) {
            errors.password = error;
          }

          if ((error = validatePassword(values.password2))) {
            errors.password2 = error;
          } else if (values.password !== values.password2) {
            errors.password2 = "Passwords do not match";
          }

          return errors;
        }}
        onSubmit={async (values, { setSubmitting, setStatus, setErrors }) => {
          try {
            await UserService.register({
              username: values.username,
              email: values.email,
              password: values.password,
            });
            await AuthService.login(values.username, values.password);
            const user = await UserService.getCurrentUser();
            setUser(user);
            history.push("/");
          } catch (error) {
            setSubmitting(false);
            if (error instanceof FetchError) {
              if (error.message) {
                setStatus({ error: error.message });
              }
              setErrors({
                username: error.data?.username,
                email: error.data?.email,
                password: error.data?.password,
              });
            } else {
              setStatus({ error: "unknown error" });
            }
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form className="Form">
            <UsernameFormField label="Username" name="username" />
            <EmailFormField label="E-mail" name="email" />
            <PasswordFormField label="Password" name="password" />
            <PasswordFormField label="Password (repeat)" name="password2" />
            <div className="FormField">
              {status?.error && (
                <div className="FormFieldError">
                  {makeSentence(status.error)}
                </div>
              )}
              <button type="submit" disabled={isSubmitting}>
                Register
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;

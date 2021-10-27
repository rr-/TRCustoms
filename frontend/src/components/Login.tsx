import { Formik, Form } from "formik";
import { History } from "history";
import { useContext } from "react";
import { AuthService } from "src/services/auth.service";
import { UserService } from "src/services/user.service";
import { FetchError } from "src/shared/client";
import PasswordFormField from "src/shared/components/PasswordFormField";
import UsernameFormField from "src/shared/components/UsernameFormField";
import { UserContext } from "src/shared/contexts/UserContext";
import { makeSentence } from "src/shared/utils";

interface ILogin {
  history: History;
}

const Login: React.FunctionComponent<ILogin> = ({ history }) => {
  const { setUser } = useContext(UserContext);

  return (
    <div className="LoginForm">
      <h1>Login</h1>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setSubmitting, setStatus, setErrors }) => {
          try {
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
            <PasswordFormField label="Password" name="password" />
            <div className="FormField">
              {status?.error && (
                <div className="FormFieldError">
                  {makeSentence(status.error)}
                </div>
              )}
              <button type="submit" disabled={isSubmitting}>
                Log in
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;

import { Formik, Form } from "formik";
import { History } from "history";
import { useCallback, useContext } from "react";
import { AuthService } from "src/services/auth.service";
import { UserService } from "src/services/user.service";
import { IUser } from "src/services/user.service";
import { FetchError } from "src/shared/client";
import PasswordFormField from "src/shared/components/PasswordFormField";
import TextFormField from "src/shared/components/TextFormField";
import { UserContext } from "src/shared/contexts/UserContext";
import { makeSentence } from "src/shared/utils";

interface ILogin {
  history: History;
}

const Login: React.FunctionComponent<ILogin> = ({ history }) => {
  const { setUser } = useContext(UserContext);

  const submit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        await AuthService.login(values.username, values.password);
        const user = await UserService.getCurrentUser();
        setUser(user);
        history.push("/");
      } catch (error) {
        setSubmitting(false);
        if (error instanceof FetchError && error.response.status === 401) {
          let user: IUser | null = null;
          try {
            user = await UserService.getUserByUsername(values.username);
          } catch (error) {}
          if (user && !user.is_active) {
            setStatus({
              error:
                "Your account was not yet activated. Please try again later :)",
            });
          } else {
            setStatus({ error: "Invalid username or password." });
          }
        } else {
          setStatus({ error: "unknown error" });
        }
      }
    },
    [history, setUser]
  );

  return (
    <div className="LoginForm">
      <h1>Login</h1>
      <Formik initialValues={{ username: "", password: "" }} onSubmit={submit}>
        {({ isSubmitting, status }) => (
          <Form className="Form">
            <TextFormField label="Username" name="username" />
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

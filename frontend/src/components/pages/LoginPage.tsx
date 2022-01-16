import { AxiosError } from "axios";
import axios from "axios";
import { Formik } from "formik";
import { Form } from "formik";
import { useCallback } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "src/services/auth.service";
import { UserService } from "src/services/user.service";
import type { User } from "src/services/user.service";
import { FormGrid } from "src/shared/components/FormGrid";
import { FormGridButtons } from "src/shared/components/FormGrid";
import { FormGridFieldSet } from "src/shared/components/FormGrid";
import { PasswordFormField } from "src/shared/components/PasswordFormField";
import { TextFormField } from "src/shared/components/TextFormField";
import { UserContext } from "src/shared/contexts/UserContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const submit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        await AuthService.login(values.username, values.password);
        const user = await UserService.getCurrentUser();
        setUser(user);
        navigate("/");
      } catch (error) {
        setSubmitting(false);
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            let user: User | null = null;
            try {
              user = await UserService.getUserByUsername(values.username);
            } catch (error) {}
            if (user && !user.is_active) {
              setStatus({
                error:
                  "Your account was not yet activated. Please try again later :)",
              });
            } else {
              setStatus({ error: <>Invalid username or password.</> });
            }
          } else {
            setStatus({ error: <>Unknown error.</> });
          }
        } else {
          setStatus({ error: <>Unknown error.</> });
        }
      }
    },
    [navigate, setUser]
  );

  return (
    <div className="LoginForm">
      <h1>Login</h1>
      <Formik initialValues={{ username: "", password: "" }} onSubmit={submit}>
        {({ isSubmitting, status }) => (
          <Form>
            <FormGrid>
              <FormGridFieldSet>
                <TextFormField label="Username" name="username" />
                <PasswordFormField label="Password" name="password" />
              </FormGridFieldSet>
              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  Log in
                </button>
              </FormGridButtons>
            </FormGrid>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { LoginPage };

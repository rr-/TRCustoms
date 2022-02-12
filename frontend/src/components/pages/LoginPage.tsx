import { AxiosError } from "axios";
import axios from "axios";
import { Formik } from "formik";
import { Form } from "formik";
import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "src/services/auth.service";
import { UserService } from "src/services/user.service";
import { FormGrid } from "src/shared/components/FormGrid";
import { FormGridButtons } from "src/shared/components/FormGrid";
import { FormGridFieldSet } from "src/shared/components/FormGrid";
import { PasswordFormField } from "src/shared/components/formfields/PasswordFormField";
import { TextFormField } from "src/shared/components/formfields/TextFormField";
import { TitleContext } from "src/shared/contexts/TitleContext";
import { UserContext } from "src/shared/contexts/UserContext";
import { makeSentence } from "src/shared/utils";
import { filterFalsyObjectValues } from "src/shared/utils";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);
  const { setUser } = useContext(UserContext);

  const handleSubmit = useCallback(
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
          const data = axiosError.response?.data;
          if (axiosError.response?.status === 401) {
            if (data.detail) {
              setStatus({ error: <>{makeSentence(data.detail)}</> });
            } else {
              setStatus({ error: <>Unknown error.</> });
            }
          } else {
            const errors = {
              username: data?.username,
              password: data?.password,
            };
            if (Object.keys(filterFalsyObjectValues(errors)).length) {
              setErrors(errors);
            } else {
              console.error(error);
              setStatus({ error: <>Unknown error.</> });
            }
          }
        } else {
          setStatus({ error: <>Unknown error.</> });
        }
      }
    },
    [navigate, setUser]
  );

  useEffect(() => {
    setTitle("Login");
  }, [setTitle]);

  return (
    <div className="LoginForm">
      <h1>Login</h1>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={handleSubmit}
      >
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

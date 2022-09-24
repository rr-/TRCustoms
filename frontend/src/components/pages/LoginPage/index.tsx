import { AxiosError } from "axios";
import axios from "axios";
import { Formik } from "formik";
import { Form } from "formik";
import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { UserResendActivationEmailButton } from "src/components/buttons/UserResendActivationEmailButton";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { PasswordFormField } from "src/components/formfields/PasswordFormField";
import { TextFormField } from "src/components/formfields/TextFormField";
import { TitleContext } from "src/contexts/TitleContext";
import { UserContext } from "src/contexts/UserContext";
import { AuthService } from "src/services/AuthService";
import { UserService } from "src/services/UserService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { makeSentence } from "src/utils/string";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);
  const { setUser } = useContext(UserContext);

  const handleSubmit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      setStatus({});
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
            if (data.code === "email_not_confirmed") {
              setStatus({
                error: (
                  <>
                    {makeSentence(data.detail)}
                    <br />
                    <UserResendActivationEmailButton
                      username={values.username}
                    />
                  </>
                ),
              });
            } else if (data.detail) {
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
                <Link to="/password-reset">Forgot password?</Link>
              </FormGridButtons>
            </FormGrid>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { LoginPage };

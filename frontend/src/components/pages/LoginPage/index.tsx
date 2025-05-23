import { AxiosError } from "axios";
import axios from "axios";
import type { FormikHelpers } from "formik";
import { Formik } from "formik";
import { Form } from "formik";
import { useCallback } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { UserResendActivationEmailButton } from "src/components/buttons/UserResendActivationEmailButton";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { PasswordFormField } from "src/components/formfields/PasswordFormField";
import { TextFormField } from "src/components/formfields/TextFormField";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserContext } from "src/contexts/UserContext";
import { AuthService } from "src/services/AuthService";
import { UserService } from "src/services/UserService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { makeSentence } from "src/utils/string";

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const initialValues: LoginFormValues = { username: "", password: "" };

  const handleSubmit = useCallback(
    async (
      values: LoginFormValues,
      { setSubmitting, setStatus, setErrors }: FormikHelpers<LoginFormValues>,
    ) => {
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
    [navigate, setUser],
  );

  usePageMetadata(() => ({ ready: true, title: "Login" }), []);

  return (
    <PlainLayout header="Login">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
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
    </PlainLayout>
  );
};

export { LoginPage };

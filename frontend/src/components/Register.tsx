import { Formik, Form } from "formik";
import { History } from "history";
import { useCallback, useContext } from "react";
import { AuthService } from "src/services/auth.service";
import { UserService } from "src/services/user.service";
import { FetchError } from "src/shared/client";
import EmailFormField from "src/shared/components/EmailFormField";
import PasswordFormField from "src/shared/components/PasswordFormField";
import TextAreaFormField from "src/shared/components/TextAreaFormField";
import TextFormField from "src/shared/components/TextFormField";
import { UserContext } from "src/shared/contexts/UserContext";
import { makeSentence } from "src/shared/utils";
import { validateUserName } from "src/shared/utils";
import { validatePassword, validateEmail } from "src/shared/utils";

interface IRegister {
  history: History;
}

const Register: React.FunctionComponent<IRegister> = ({ history }) => {
  const { setUser } = useContext(UserContext);

  const validate = (values) => {
    const errors: {
      username?: string;
      firstName?: string;
      last_name?: string;
      email?: string;
      password?: string;
      password2?: string;
      bio?: string;
    } = {};

    let error;

    if ((error = validateUserName(values.username))) {
      errors.username = makeSentence(error);
    }

    if ((error = validateEmail(values.email))) {
      errors.email = makeSentence(error);
    }

    if ((error = validatePassword(values.password))) {
      errors.password = makeSentence(error);
    }

    if ((error = validatePassword(values.password2))) {
      errors.password2 = makeSentence(error);
    } else if (values.password !== values.password2) {
      errors.password2 = makeSentence("Passwords do not match");
    }

    return errors;
  };

  const submit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        await UserService.register({
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          bio: values.bio,
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
            firstName: error.data?.first_name,
            lastName: error.data?.last_name,
            email: error.data?.email,
            password: error.data?.password,
            bio: error.data?.bio,
          });
        } else {
          setStatus({ error: "unknown error" });
        }
      }
    },
    []
  );

  return (
    <div className="RegisterForm">
      <h1>Register</h1>
      <Formik
        initialValues={{
          username: "",
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          password2: "",
          bio: "",
        }}
        validate={validate}
        onSubmit={submit}
      >
        {({ isSubmitting, status }) => (
          <Form className="Form">
            <TextFormField required={true} label="Username" name="username" />
            <TextFormField label="First name" name="firstName" />
            <TextFormField label="Last name" name="lastName" />
            <EmailFormField required={true} label="E-mail" name="email" />
            <PasswordFormField
              required={true}
              label="Password"
              name="password"
            />
            <PasswordFormField
              required={true}
              label="Password (repeat)"
              name="password2"
            />
            <TextAreaFormField label="Bio" name="bio" />
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

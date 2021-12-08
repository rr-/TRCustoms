import { Formik, Form } from "formik";
import { History } from "history";
import { useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthService } from "src/services/auth.service";
import { UserService } from "src/services/user.service";
import { FetchError } from "src/shared/client";
import EmailFormField from "src/shared/components/EmailFormField";
import PasswordFormField from "src/shared/components/PasswordFormField";
import TextAreaFormField from "src/shared/components/TextAreaFormField";
import TextFormField from "src/shared/components/TextFormField";
import { UserContext } from "src/shared/contexts/UserContext";
import { makeSentence } from "src/shared/utils";
import {
  validateUserName,
  validateRequired,
  validatePassword,
  validatePassword2,
  validateEmail,
} from "src/shared/utils";

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

    const validatorMap = {
      username: [validateRequired, validateUserName],
      email: [validateRequired, validateEmail],
      password: [validateRequired, validatePassword],
      password2: [
        validateRequired,
        validatePassword,
        (source) => validatePassword2(source, values.password2),
      ],
    };
    for (const [field, validators] of Object.entries(validatorMap)) {
      for (let validator of validators) {
        const error = validator(values[field]);
        if (error) {
          errors[field] = makeSentence(error);
        }
        break;
      }
    }

    return errors;
  };

  const submit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        const user = await UserService.register({
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          bio: values.bio,
        });
        if (user.is_active) {
          await AuthService.login(values.username, values.password);
          const user = await UserService.getCurrentUser();
          setUser(user);
          history.push("/");
        } else {
          setStatus({
            success: (
              <>
                Your account was created. Now it needs to be activated by
                someone from staff. Please have patience :) In the meantime, why
                don't you take a look at <Link to={"/"}>some levels</Link>?
              </>
            ),
          });
        }
      } catch (error) {
        setSubmitting(false);
        if (error instanceof FetchError) {
          if (error.message) {
            setStatus({ error: <>{makeSentence(error.message)}</> });
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
          setStatus({ error: <>Unknown error.</> });
        }
      }
    },
    [history, setUser]
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
        {({ isSubmitting, status }) =>
          status?.success ? (
            <div className="FormFieldSuccess">{status.success}</div>
          ) : (
            <Form className="Form">
              <fieldset>
                <legend>Basic data</legend>
                <TextFormField
                  required={true}
                  label="Username"
                  name="username"
                />
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
              </fieldset>

              <fieldset>
                <legend>Extra information</legend>
                <TextFormField label="First name" name="firstName" />
                <TextFormField label="Last name" name="lastName" />
                <TextAreaFormField label="Bio" name="bio" />
              </fieldset>

              <div className="FormField">
                {status?.error && (
                  <div className="FormFieldError">{status.error}</div>
                )}
                <button type="submit" disabled={isSubmitting}>
                  Register
                </button>
              </div>
            </Form>
          )
        }
      </Formik>
    </div>
  );
};

export default Register;

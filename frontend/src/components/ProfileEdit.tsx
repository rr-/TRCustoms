import { Formik, Form } from "formik";
import { useCallback } from "react";
import { useQuery } from "react-query";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { IUser, UserService } from "src/services/user.service";
import { FetchError } from "src/shared/client";
import EmailFormField from "src/shared/components/EmailFormField";
import Loader from "src/shared/components/Loader";
import PasswordFormField from "src/shared/components/PasswordFormField";
import PictureFormField from "src/shared/components/PictureFormField";
import TextAreaFormField from "src/shared/components/TextAreaFormField";
import TextFormField from "src/shared/components/TextFormField";
import { makeSentence } from "src/shared/utils";
import {
  validateUserName,
  validateRequired,
  validatePassword,
  validatePassword2,
  validateEmail,
} from "src/shared/utils";

const ProfileEdit: React.FunctionComponent = () => {
  const history = useHistory();
  const { userId }: { userId: string } = useParams();

  const userQuery = useQuery<IUser, Error>(
    ["user", userId],
    async () => await UserService.getUserById(+userId)
  );

  const validate = (values) => {
    const errors: {
      username?: string;
      firstName?: string;
      last_name?: string;
      email?: string;
      old_password?: string;
      password?: string;
      password2?: string;
      bio?: string;
      picture?: string;
    } = {};

    const validatorMap = {
      username: [validateRequired, validateUserName],
      email: [validateRequired, validateEmail],
      old_password: [validatePassword],
      password: [validatePassword],
      password2: [
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

  const goBack = useCallback(() => {
    history.push(`/profile/${userId}`);
  }, [history, userId]);

  const submit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        await UserService.update(+userId, {
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          old_password: values.old_password,
          password: values.password,
          bio: values.bio,
        });

        if (values.picture) {
          await UserService.updatePicture(+userId, values.picture);
        }

        setStatus({
          success: (
            <>
              Profile information updated.{" "}
              <Link to={`/profile/${userId}`}>Click here</Link> to see the
              changes.
            </>
          ),
        });
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
            old_password: error.data?.old_password,
            password: error.data?.password,
            bio: error.data?.bio,
            picture: error.data?.picture,
          });
        } else {
          setStatus({ error: <>Unknown error.</> });
        }
      }
    },
    [userId]
  );

  if (userQuery.isLoading) {
    return <Loader />;
  }

  if (userQuery.error) {
    return <p>{userQuery.error.message}</p>;
  }

  const user = userQuery.data;
  const initialValues = {
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    old_password: "",
    password: "",
    password2: "",
    bio: user.bio,
    picture: null,
  };

  return (
    <div id="ProfileEdit">
      <h1>Editing {user.username}'s profile</h1>

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={submit}
      >
        {({ isSubmitting, status }) => (
          <Form className="Form">
            <fieldset>
              <legend>Basic data</legend>
              <TextFormField required={true} label="Username" name="username" />
              <EmailFormField required={true} label="E-mail" name="email" />
              <PasswordFormField
                label="Old password (fill only if you want to change password)"
                name="old_password"
              />
              <PasswordFormField
                label="Password (leave empty to keep current)"
                name="password"
              />
              <PasswordFormField label="Password (repeat)" name="password2" />
            </fieldset>

            <fieldset>
              <legend>Extra information</legend>
              <TextFormField label="First name" name="firstName" />
              <TextFormField label="Last name" name="lastName" />
              <TextAreaFormField label="Bio" name="bio" />
              <PictureFormField
                label="Picture (leave empty to keep current)"
                name="picture"
              />
            </fieldset>

            <div className="FormField">
              {status?.success && (
                <div className="FormFieldSuccess">{status.success}</div>
              )}
              {status?.error && (
                <div className="FormFieldError">{status.error}</div>
              )}
              <button type="submit" disabled={isSubmitting}>
                Update profile
              </button>
              <button type="button" onClick={goBack}>
                Go back
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfileEdit;

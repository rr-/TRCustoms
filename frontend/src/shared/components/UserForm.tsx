import { Formik } from "formik";
import { Form } from "formik";
import { useCallback } from "react";
import { FileService } from "src/services/file.service";
import { UploadType } from "src/services/file.service";
import type { User } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import { FetchError } from "src/shared/client";
import EmailFormField from "src/shared/components/EmailFormField";
import PasswordFormField from "src/shared/components/PasswordFormField";
import PictureFormField from "src/shared/components/PictureFormField";
import TextAreaFormField from "src/shared/components/TextAreaFormField";
import TextFormField from "src/shared/components/TextFormField";
import UserLink from "src/shared/components/UserLink";
import { makeSentence } from "src/shared/utils";
import {
  validateUserName,
  validateRequired,
  validatePassword,
  validatePassword2,
  validateEmail,
} from "src/shared/utils";

interface UserFormProps {
  user?: User | null;
  onGoBack?: () => any | null;
  onSubmit?: (user: User, password: string | null) => any | null;
}

const UserForm = ({ user, onGoBack, onSubmit }: UserFormProps) => {
  const initialValues = {
    username: user?.username || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    oldPassword: "",
    password: "",
    password2: "",
    bio: user?.bio || "",
    picture: null,
  };

  const submit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        const payload = {
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          oldPassword: values.oldPassword || values.password,
          password: values.password,
          bio: values.bio,
          picture: null,
        };

        if (user) {
          if (values.picture) {
            const uploadedFile = await FileService.uploadFile(
              values.picture,
              UploadType.UserPicture
            );
            payload.picture = uploadedFile.id;
          }

          let outUser = await UserService.update(user.id, payload);

          onSubmit?.(outUser, values.password);

          setStatus({
            success: (
              <>
                Profile information updated.{" "}
                <UserLink user={outUser} label="Click here" /> to see the
                changes.
              </>
            ),
          });
        } else {
          let outUser = await UserService.register(payload);
          onSubmit?.(outUser, values.password);
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
            oldPassword: error.data?.old_password,
            password: error.data?.password,
            bio: error.data?.bio,
            picture: error.data?.picture || error.data?.content,
          });
        } else {
          console.error(error);
          setStatus({ error: <>Unknown error.</> });
        }
      }
    },
    [user, onSubmit]
  );

  const validate = (values) => {
    const errors: {
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      oldPassword?: string;
      password?: string;
      password2?: string;
      bio?: string;
      picture?: string;
    } = {};

    const validatorMap = {
      username: [validateRequired, validateUserName],
      email: [validateRequired, validateEmail],
      oldPassword: [],
      password: [validatePassword],
      password2: [
        validatePassword,
        (source) => validatePassword2(source, values.password2),
      ],
    };

    if (user) {
      validatorMap.oldPassword.push(validatePassword);
    } else {
      validatorMap.password.splice(0, 0, validateRequired);
      validatorMap.password2.splice(0, 0, validateRequired);
    }

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

  return (
    <Formik initialValues={initialValues} validate={validate} onSubmit={submit}>
      {({ isSubmitting, status }) =>
        !user && status?.success ? (
          <div className="FormFieldSuccess">{status.success}</div>
        ) : (
          <Form className="Form">
            <fieldset>
              <legend>Basic data</legend>
              <TextFormField required={true} label="Username" name="username" />
              <EmailFormField required={true} label="E-mail" name="email" />
              {user && (
                <PasswordFormField
                  label="Old password (fill only if you want to change password)"
                  name="oldPassword"
                />
              )}
              <PasswordFormField
                required={!user}
                label={
                  user ? "Password (leave empty to keep current)" : "Password"
                }
                name="password"
              />
              <PasswordFormField
                required={!user}
                label="Password (repeat)"
                name="password2"
              />
            </fieldset>

            <fieldset>
              <legend>Extra information</legend>
              <TextFormField label="First name" name="firstName" />
              <TextFormField label="Last name" name="lastName" />
              <TextAreaFormField label="Bio" name="bio" />
              {user && (
                <PictureFormField
                  label="Picture (leave empty to keep current)"
                  name="picture"
                />
              )}
            </fieldset>

            <div className="FormField">
              {status?.success && (
                <div className="FormFieldSuccess">{status.success}</div>
              )}
              {status?.error && (
                <div className="FormFieldError">{status.error}</div>
              )}
              <button type="submit" disabled={isSubmitting}>
                {user ? "Update profile" : "Register"}
              </button>
              {onGoBack && (
                <button type="button" onClick={onGoBack}>
                  Go back
                </button>
              )}
            </div>
          </Form>
        )
      }
    </Formik>
  );
};

export default UserForm;

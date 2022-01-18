import { AxiosError } from "axios";
import axios from "axios";
import { Formik } from "formik";
import { Form } from "formik";
import { useCallback } from "react";
import { UploadType } from "src/services/file.service";
import type { User } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import { FormGrid } from "src/shared/components/FormGrid";
import { FormGridButtons } from "src/shared/components/FormGrid";
import { FormGridFieldSet } from "src/shared/components/FormGrid";
import { PicturePicker } from "src/shared/components/PicturePicker";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import { EmailFormField } from "src/shared/components/formfields/EmailFormField";
import { PasswordFormField } from "src/shared/components/formfields/PasswordFormField";
import { TextAreaFormField } from "src/shared/components/formfields/TextAreaFormField";
import { TextFormField } from "src/shared/components/formfields/TextFormField";
import { UserLink } from "src/shared/components/links/UserLink";
import { filterFalsyObjectValues } from "src/shared/utils";
import { makeSentence } from "src/shared/utils";
import { validateUserName } from "src/shared/utils";
import { validateRequired } from "src/shared/utils";
import { validatePassword } from "src/shared/utils";
import { validatePassword2 } from "src/shared/utils";
import { validateEmail } from "src/shared/utils";

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
    picture_id: user?.picture?.id || null,
  };

  const handleSubmitError = useCallback(
    (error, { setSubmitting, setStatus, setErrors }) => {
      setSubmitting(false);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const data = axiosError.response?.data;
        if (data.detail) {
          setStatus({ error: <>{makeSentence(data.detail)}</> });
        }
        const errors = {
          username: data?.username,
          firstName: data?.first_name,
          lastName: data?.last_name,
          email: data?.email,
          oldPassword: data?.old_password,
          password: data?.password,
          bio: data?.bio,
          picture_id: data?.picture,
        };
        if (filterFalsyObjectValues(errors).length) {
          setErrors(errors);
        } else {
          console.error(error);
          setStatus({ error: <>Unknown error.</> });
        }
      } else {
        console.error(error);
        setStatus({ error: <>Unknown error.</> });
      }
    },
    []
  );

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
          picture_id: values.picture_id,
        };

        if (user?.id) {
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
        handleSubmitError(error, { setSubmitting, setStatus, setErrors });
      }
    },
    [user, onSubmit, handleSubmitError]
  );

  const validate = (values: { [key: string]: any }) => {
    const errors: {
      [key: string]: string | null;
    } = {};

    const validatorMap: {
      [field: string]: Array<(value: any) => string | null>;
    } = {
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
      {({ isSubmitting, setFieldValue, status }) =>
        !user && status?.success ? (
          <div className="FormFieldSuccess">{status.success}</div>
        ) : (
          <Form className="Form">
            <FormGrid>
              <FormGridFieldSet title="Basic information">
                <TextFormField
                  required={true}
                  label="Username"
                  name="username"
                />
                <EmailFormField required={true} label="E-mail" name="email" />
                {user && (
                  <PasswordFormField
                    label="Old password"
                    extraInformation="Fill only if you want to change the password."
                    name="oldPassword"
                  />
                )}
                <PasswordFormField
                  required={!user}
                  label="Password"
                  extraInformation={
                    user ? "Leave empty to keep the current password." : ""
                  }
                  name="password"
                />
                <PasswordFormField
                  required={!user}
                  label="Password (repeat)"
                  name="password2"
                />
              </FormGridFieldSet>

              <FormGridFieldSet title="Extra information">
                <TextFormField label="First name" name="firstName" />
                <TextFormField label="Last name" name="lastName" />
                <TextAreaFormField label="Bio" name="bio" />
                {user && (
                  <BaseFormField
                    required={false}
                    label="Picture"
                    name="picture_id"
                  >
                    <PicturePicker
                      allowMultiple={false}
                      allowClear={true}
                      uploadType={UploadType.UserPicture}
                      fileIds={user?.picture ? [user?.picture.id] : []}
                      onChange={([fileId]) =>
                        setFieldValue("picture_id", fileId || null)
                      }
                    />
                  </BaseFormField>
                )}
              </FormGridFieldSet>

              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  {user ? "Update profile" : "Register"}
                </button>
                {onGoBack && (
                  <button type="button" onClick={onGoBack}>
                    Go back
                  </button>
                )}
              </FormGridButtons>
            </FormGrid>
          </Form>
        )
      }
    </Formik>
  );
};

export { UserForm };

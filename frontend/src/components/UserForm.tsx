import { AxiosError } from "axios";
import axios from "axios";
import { Formik } from "formik";
import { Form } from "formik";
import { useContext } from "react";
import { useCallback } from "react";
import { FormGrid } from "src/components/FormGrid";
import { FormGridButtons } from "src/components/FormGrid";
import { FormGridFieldSet } from "src/components/FormGrid";
import { PicturePicker } from "src/components/PicturePicker";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import { DropDownFormField } from "src/components/formfields/DropDownFormField";
import { EmailFormField } from "src/components/formfields/EmailFormField";
import { PasswordFormField } from "src/components/formfields/PasswordFormField";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { TextFormField } from "src/components/formfields/TextFormField";
import { UserLink } from "src/components/links/UserLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import { UploadType } from "src/services/FileService";
import type { UserDetails } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { DisplayMode } from "src/types";
import { filterFalsyObjectValues } from "src/utils";
import { makeSentence } from "src/utils";
import { validateUserName } from "src/utils";
import { validateRequired } from "src/utils";
import { validatePassword } from "src/utils";
import { validatePassword2 } from "src/utils";
import { validateEmail } from "src/utils";

interface UserFormProps {
  user?: UserDetails | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((user: UserDetails, password: string | null) => void) | undefined;
}

const UserForm = ({ user, onGoBack, onSubmit }: UserFormProps) => {
  const { config } = useContext(ConfigContext);

  const initialValues = {
    username: user?.username || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    oldPassword: "",
    password: "",
    password2: "",
    bio: user?.bio || "",
    pictureId: user?.picture?.id || undefined,
    countryCode: user?.country?.code || undefined,
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
          pictureId: data?.picture,
          countryCode: data?.country_code,
        };
        if (Object.keys(filterFalsyObjectValues(errors)).length) {
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

  const handleSubmit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      setStatus({});
      try {
        const payload = {
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          oldPassword: values.oldPassword || values.password,
          password: values.password,
          bio: values.bio,
          pictureId: values.pictureId,
          countryCode: values.countryCode,
        };

        if (user?.id) {
          let outUser = await UserService.update(user.id, payload);

          onSubmit?.(outUser, values.password);

          setStatus({
            success: (
              <>
                Profile information updated.{" "}
                <UserLink user={outUser}>Click here</UserLink> to see the
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

  const countryOptions = config.countries.map((country) => ({
    label: country.name,
    value: country.code,
  }));

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={handleSubmit}
    >
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
                <DropDownFormField
                  label="Country"
                  name="countryCode"
                  allowNull={true}
                  options={countryOptions}
                />
                {user && (
                  <BaseFormField
                    required={false}
                    label="Picture"
                    name="pictureId"
                  >
                    <PicturePicker
                      displayMode={DisplayMode.Contain}
                      allowMultiple={false}
                      allowClear={true}
                      uploadType={UploadType.UserPicture}
                      fileIds={user?.picture ? [user?.picture.id] : []}
                      onChange={([fileId]) =>
                        setFieldValue("pictureId", fileId || null)
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

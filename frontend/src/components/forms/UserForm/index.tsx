import { zodResolver } from "@hookform/resolvers/zod";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { PicturePicker } from "src/components/common/PicturePicker";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { BaseField } from "src/components/forms/fields/BaseField";
import { DropDownField } from "src/components/forms/fields/DropDownField";
import { EmailField } from "src/components/forms/fields/EmailField";
import { PasswordField } from "src/components/forms/fields/PasswordField";
import { TextAreaField } from "src/components/forms/fields/TextAreaField";
import { TextField } from "src/components/forms/fields/TextField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { UserLink } from "src/components/links/UserLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import { AuthService } from "src/services/AuthService";
import { UploadType } from "src/services/FileService";
import type { UserDetails } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { useUser } from "src/stores/user";
import { DisplayMode } from "src/types";
import { makeSentence } from "src/utils/string";
import { firstError } from "src/utils/validation";
import { validateEmail } from "src/utils/validation";
import { validatePassword } from "src/utils/validation";
import { validatePassword2 } from "src/utils/validation";
import { validateRequired } from "src/utils/validation";
import { validateURL } from "src/utils/validation";
import { validateUserName } from "src/utils/validation";
import { z } from "zod";

const RegistrationDisclaimer = () => {
  return (
    <InfoMessage type={InfoMessageType.Info}>
      <span>
        By registering, you agree to abide by the website's{" "}
        <Link target="_blank" to="/about/terms">
          Terms and Conditions
        </Link>
        .
      </span>
    </InfoMessage>
  );
};

interface UserFormProps {
  user?: UserDetails | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((user: UserDetails, password: string | null) => void) | undefined;
}

const baseSchema = z.object({
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  oldPassword: z.string(),
  password: z.string(),
  password2: z.string(),
  bio: z.string(),
  pictureId: z.number().nullish(),
  countryCode: z.string(),
  websiteUrl: z.string(),
  donationUrl: z.string(),
});
type UserFormValues = z.infer<typeof baseSchema>;

// Reuse the existing field validators inside the schema so the rules stay in
// one place. Each field runs its validators in order and reports the first
// error against that field.
const makeSchema = (isNew: boolean) =>
  baseSchema.superRefine((values, ctx) => {
    // Required always runs first so an empty field reports "required" rather
    // than a format error.
    const required = isNew ? [validateRequired] : [];
    const errors = {
      username: firstError(values.username, [
        validateRequired,
        validateUserName,
      ]),
      email: firstError(values.email, [validateRequired, validateEmail]),
      websiteUrl: firstError(values.websiteUrl, [validateURL]),
      donationUrl: firstError(values.donationUrl, [validateURL]),
      password: firstError(values.password, [...required, validatePassword]),
      password2: firstError(values.password2, [
        ...required,
        (v) => validatePassword2(v, values.password),
        validatePassword,
      ]),
    };
    for (const [field, error] of Object.entries(errors)) {
      if (error) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: makeSentence(error),
        });
      }
    }
  });

const UserForm = ({ user, onGoBack, onSubmit }: UserFormProps) => {
  const { config } = useContext(ConfigContext);
  const { setUser } = useUser();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(makeSchema(!user)),
    defaultValues: {
      username: user?.username || "",
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      oldPassword: "",
      password: "",
      password2: "",
      bio: user?.bio || "",
      pictureId: user?.picture?.id || undefined,
      countryCode: user?.country?.iso_3166_1_alpha2 || "",
      websiteUrl: user?.website_url || "",
      donationUrl: user?.donation_url || "",
    },
  });

  const { submit, result } = useFormSubmit(form, async (values) => {
    const payload = {
      username: values.username,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      oldPassword: values.oldPassword || values.password,
      password: values.password,
      bio: values.bio,
      pictureId: values.pictureId as number | undefined,
      countryCode: values.countryCode,
      websiteUrl: values.websiteUrl,
      donationUrl: values.donationUrl,
    };

    if (user?.id) {
      const outUser = await UserService.update(user.id, payload);
      onSubmit?.(outUser, values.password);
      if (user.email !== values.email) {
        setUser(null);
        AuthService.logout();
        return {
          success: (
            <>
              Profile information updated. You were logged out. Please check
              your mailbox and confirm your new e-mail address.
            </>
          ),
        };
      }
      return {
        success: (
          <>
            Profile information updated.{" "}
            <UserLink user={outUser}>Click here</UserLink> to see the changes.
          </>
        ),
      };
    }

    const outUser = await UserService.register(payload);
    onSubmit?.(outUser, values.password);
  });

  const countryOptions = config.countries.map((country) => ({
    label: country.name,
    value: country.iso_3166_1_alpha2,
  }));

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid>
        <FormGridFieldSet title="Basic information">
          <TextField required={true} label="Username" name="username" />
          <EmailField
            required={true}
            label="E-mail"
            name="email"
            extraInformation="Changing the e-mail will require confirmation and cause you to log out."
          />
          {user && (
            <PasswordField
              label="Old password"
              extraInformation="Fill only if you want to change the password."
              name="oldPassword"
            />
          )}
          <PasswordField
            required={!user}
            label="Password"
            extraInformation={
              user ? "Leave empty to keep the current password." : ""
            }
            name="password"
          />
          <PasswordField
            required={!user}
            label="Password (repeat)"
            name="password2"
          />
        </FormGridFieldSet>

        <FormGridFieldSet title="Extra information">
          <TextField label="First name" name="firstName" />
          <TextField label="Last name" name="lastName" />
          <TextField label="Website link" name="websiteUrl" />
          <TextField label="Donation link" name="donationUrl" />
          <TextAreaField
            label="Bio"
            name="bio"
            rich={true}
            markdownLimitKey="user_bio"
          />
          <DropDownField
            label="Country"
            name="countryCode"
            allowNull={true}
            options={countryOptions}
          />
          {user && (
            <BaseField required={false} label="Picture" name="pictureId">
              <PicturePicker
                displayMode={DisplayMode.Contain}
                allowMultiple={false}
                allowClear={true}
                uploadType={UploadType.UserPicture}
                fileIds={user?.picture ? [user?.picture.id] : []}
                onChange={([fileId]) =>
                  form.setValue("pictureId", fileId || null)
                }
              />
            </BaseField>
          )}
        </FormGridFieldSet>

        <FormButtons
          result={result}
          extra={!user?.id ? <RegistrationDisclaimer /> : undefined}
        >
          <button type="submit" disabled={form.formState.isSubmitting}>
            {user ? "Update profile" : "Register"}
          </button>
          {onGoBack && (
            <button type="button" onClick={onGoBack}>
              Go back
            </button>
          )}
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

export { UserForm };

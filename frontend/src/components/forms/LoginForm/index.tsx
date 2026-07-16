import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { UserResendActivationEmailButton } from "src/components/buttons/UserResendActivationEmailButton";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { PasswordField } from "src/components/forms/fields/PasswordField";
import { TextField } from "src/components/forms/fields/TextField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { AuthService } from "src/services/AuthService";
import { UserService } from "src/services/UserService";
import { useUser } from "src/stores/user";
import { getResponseError } from "src/utils/misc";
import { makeSentence } from "src/utils/string";

interface LoginFormProps {
  onLogin?: (() => void) | undefined;
}

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const { setUser } = useUser();
  const form = useForm<LoginFormValues>({
    defaultValues: { username: "", password: "" },
  });

  const { submit, result } = useFormSubmit(form, async (values) => {
    try {
      await AuthService.login(values.username, values.password);
      setUser(await UserService.getCurrentUser());
      onLogin?.();
    } catch (error) {
      // Unconfirmed accounts get a resend-activation prompt; everything else
      // falls through to useFormSubmit's field-error / banner handling.
      const data = getResponseError(error);
      if (data?.code === "email_not_confirmed") {
        return {
          error: (
            <>
              {makeSentence(String(data.detail))}
              <br />
              <UserResendActivationEmailButton username={values.username} />
            </>
          ),
        };
      }
      throw error;
    }
  });

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid>
        <FormGridFieldSet>
          <TextField label="Username" name="username" />
          <PasswordField label="Password" name="password" />
        </FormGridFieldSet>
        <FormButtons result={result}>
          <button type="submit" disabled={form.formState.isSubmitting}>
            Log in
          </button>
          <Link to="/password-reset">Forgot password?</Link>
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

export { LoginForm };

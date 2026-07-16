import { useCallback } from "react";
import { useContext } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { UserResendActivationEmailButton } from "src/components/buttons/UserResendActivationEmailButton";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { PasswordField } from "src/components/forms/PasswordField";
import { TextField } from "src/components/forms/TextField";
import { applyServerErrors } from "src/components/forms/serverErrors";
import type { FormResult } from "src/components/forms/useFormSubmit";
import { UserContext } from "src/contexts/UserContext";
import { AuthService } from "src/services/AuthService";
import { UserService } from "src/services/UserService";
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
  const { setUser } = useContext(UserContext);
  const [result, setResult] = useState<FormResult | null>(null);
  const form = useForm<LoginFormValues>({
    defaultValues: { username: "", password: "" },
  });

  // Login carries custom error handling (the resend-activation prompt), so it
  // manages its own submit rather than using useFormSubmit.
  const submit = form.handleSubmit(
    useCallback(
      async (values: LoginFormValues) => {
        setResult(null);
        try {
          await AuthService.login(values.username, values.password);
          const user = await UserService.getCurrentUser();
          setUser(user);
          onLogin?.();
        } catch (error) {
          const data = getResponseError(error);
          if (!data) {
            setResult({ error: <>Unknown error.</> });
          } else if (data.code === "email_not_confirmed") {
            setResult({
              error: (
                <>
                  {makeSentence(data.detail)}
                  <br />
                  <UserResendActivationEmailButton username={values.username} />
                </>
              ),
            });
          } else if (data.detail) {
            setResult({ error: <>{makeSentence(data.detail)}</> });
          } else if (!applyServerErrors(form, data)) {
            console.error(error);
            setResult({ error: <>Unknown error.</> });
          }
        }
      },
      [onLogin, setUser, form],
    ),
  );

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

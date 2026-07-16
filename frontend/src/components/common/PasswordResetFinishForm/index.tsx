import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { PasswordField } from "src/components/forms/PasswordField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { UserService } from "src/services/UserService";
import { makeSentence } from "src/utils/string";
import { validatePassword } from "src/utils/validation";
import { validatePassword2 } from "src/utils/validation";
import { validateRequired } from "src/utils/validation";
import { z } from "zod";

interface PasswordResetFinishFormProps {
  token: string;
}

const schema = z
  .object({ password: z.string(), password2: z.string() })
  .superRefine((values, ctx) => {
    const rules: { [field: string]: Array<(value: any) => string | null> } = {
      password: [validatePassword, validateRequired],
      password2: [
        (v) => validatePassword2(v, values.password),
        validatePassword,
        validateRequired,
      ],
    };
    for (const [field, validators] of Object.entries(rules)) {
      for (const validator of validators) {
        const error = validator((values as Record<string, any>)[field]);
        if (error) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: makeSentence(error),
          });
          break;
        }
      }
    }
  });
type PasswordResetFinishFormValues = z.infer<typeof schema>;

const PasswordResetFinishForm = ({ token }: PasswordResetFinishFormProps) => {
  const form = useForm<PasswordResetFinishFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", password2: "" },
  });

  const { submit, result } = useFormSubmit(form, async (values) => {
    await UserService.completePasswordReset(values.password, token);
    return {
      final: true,
      success: (
        <>
          Password reset complete. You may now <Link to={"/login"}>log in</Link>
          .
        </>
      ),
    };
  });

  if (result?.final && result.success) {
    return <>{result.success}</>;
  }

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid>
        <FormGridFieldSet>
          <PasswordField required={true} label="Password" name="password" />
          <PasswordField
            required={true}
            label="Password (repeat)"
            name="password2"
          />
        </FormGridFieldSet>
        <FormButtons result={result}>
          <button type="submit" disabled={form.formState.isSubmitting}>
            Reset password
          </button>
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

export { PasswordResetFinishForm };

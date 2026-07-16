import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { EmailField } from "src/components/forms/fields/EmailField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { UserService } from "src/services/UserService";
import { makeSentence } from "src/utils/string";
import { firstError } from "src/utils/validation";
import { validateEmail } from "src/utils/validation";
import { validateRequired } from "src/utils/validation";
import { z } from "zod";

const schema = z.object({ email: z.string() }).superRefine((values, ctx) => {
  const error = firstError(values.email, [validateRequired, validateEmail]);
  if (error) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: makeSentence(error),
    });
  }
});
type PasswordResetFormValues = z.infer<typeof schema>;

const PasswordResetForm = () => {
  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const { submit, result } = useFormSubmit(form, async (values) => {
    await UserService.requestPasswordReset(values.email);
    return {
      final: true,
      success: (
        <>
          If the e-mail was correct, an email with further instructions will be
          sent to your mailbox.
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
          <EmailField required={true} label="E-mail" name="email" />
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

export { PasswordResetForm };

import { applyServerErrors } from "./serverErrors";
import type { ReactNode } from "react";
import { useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { extractErrorMessage } from "src/utils/misc";
import { getResponseError } from "src/utils/misc";

interface FormResult {
  success?: ReactNode;
  error?: ReactNode;
  final?: boolean;
}

interface FormSuccess {
  success: ReactNode;
  final?: boolean;
}

// The submit scaffold shared by every form: run the handler, and on failure
// push field errors onto their inputs (see applyServerErrors) while surfacing
// any remaining message as a banner. The handler returns the success state to
// display, or nothing. This replaces the per-form handleSubmit/setStatus/
// try-catch that used to be copy-pasted into each form.
const useFormSubmit = <T extends FieldValues>(
  form: UseFormReturn<T>,
  handler: (values: T) => Promise<FormSuccess | void>,
) => {
  const [result, setResult] = useState<FormResult | null>(null);

  const submit = form.handleSubmit(async (values) => {
    setResult(null);
    try {
      const outcome = await handler(values);
      setResult(outcome ?? null);
    } catch (error) {
      console.error(error);
      const body = getResponseError(error);
      const appliedField =
        body && typeof body === "object" && !Array.isArray(body)
          ? applyServerErrors(form, body as Record<string, unknown>)
          : false;
      setResult(appliedField ? {} : { error: extractErrorMessage(error) });
    }
  });

  return { submit, result };
};

export type { FormResult, FormSuccess };
export { useFormSubmit };

import { FormProvider } from "react-hook-form";
import type { FieldValues, UseFormReturn } from "react-hook-form";

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}

// Wraps the form in react-hook-form's context so field components can bind
// themselves, and renders the native <form>. `noValidate` hands validation to
// the zod resolver rather than the browser.
const Form = <T extends FieldValues>({
  form,
  onSubmit,
  children,
}: FormProps<T>) => (
  <FormProvider {...form}>
    <form onSubmit={onSubmit} noValidate>
      {children}
    </form>
  </FormProvider>
);

export { Form };

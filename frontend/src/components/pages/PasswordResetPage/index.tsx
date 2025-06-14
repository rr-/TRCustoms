import type { FormikHelpers } from "formik";
import { Formik } from "formik";
import { Form } from "formik";
import { useState } from "react";
import { useCallback } from "react";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { EmailFormField } from "src/components/formfields/EmailFormField";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserService } from "src/services/UserService";
import { makeSentence } from "src/utils/string";
import { validateEmail } from "src/utils/validation";
import { validateRequired } from "src/utils/validation";

interface PasswordResetFormValues {
  email: string;
}

const PasswordResetPage = () => {
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = useCallback(
    async (
      values: PasswordResetFormValues,
      { setSubmitting, setStatus }: FormikHelpers<PasswordResetFormValues>,
    ) => {
      setStatus({});
      try {
        await UserService.requestPasswordReset(values.email);
        setIsComplete(true);
      } catch (error) {
        setSubmitting(false);
        console.error(error);
        setStatus({ error: <>Unknown error.</> });
      }
    },
    [setIsComplete],
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Password Reset",
      description: "Forgot your password? Reset it here!",
    }),
    [],
  );

  const validate = (values: Record<string, any>) => {
    const errors: {
      [key: string]: string | null;
    } = {};

    const validatorMap: {
      [field: string]: Array<(value: any) => string | null>;
    } = {
      email: [validateRequired, validateEmail],
    };

    for (const [field, validators] of Object.entries(validatorMap)) {
      for (let validator of validators) {
        const error = validator(values[field]);
        if (error) {
          errors[field] = makeSentence(error);
          break;
        }
      }
    }

    return errors;
  };

  return (
    <PlainLayout header="Password Reset">
      {isComplete ? (
        <>
          If the e-mail was correct, an email with further instructions will be
          sent to your mailbox.
        </>
      ) : (
        <Formik
          initialValues={{ email: "" }}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form>
              <FormGrid>
                <FormGridFieldSet>
                  <EmailFormField required={true} label="E-mail" name="email" />
                </FormGridFieldSet>
                <FormGridButtons status={status}>
                  <button type="submit" disabled={isSubmitting}>
                    Reset password
                  </button>
                </FormGridButtons>
              </FormGrid>
            </Form>
          )}
        </Formik>
      )}
    </PlainLayout>
  );
};

export { PasswordResetPage };

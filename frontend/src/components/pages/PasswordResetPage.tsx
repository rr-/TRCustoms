import { Formik } from "formik";
import { Form } from "formik";
import { useState } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { FormGrid } from "src/components/FormGrid";
import { FormGridButtons } from "src/components/FormGrid";
import { FormGridFieldSet } from "src/components/FormGrid";
import { EmailFormField } from "src/components/formfields/EmailFormField";
import { TitleContext } from "src/contexts/TitleContext";
import { UserService } from "src/services/UserService";
import { validateEmail } from "src/utils";
import { validateRequired } from "src/utils";
import { makeSentence } from "src/utils";

const PasswordResetPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = useCallback(
    async (values, { setSubmitting, setStatus }) => {
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
    [setIsComplete]
  );

  useEffect(() => {
    setTitle("Password Reset");
  }, [setTitle]);

  const validate = (values: { [key: string]: any }) => {
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
        }
        break;
      }
    }

    return errors;
  };

  return (
    <div className="PasswordResetPage">
      <h1>Password Reset</h1>

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
    </div>
  );
};

export { PasswordResetPage };
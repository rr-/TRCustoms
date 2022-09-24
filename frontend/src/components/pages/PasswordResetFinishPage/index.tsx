import { Formik } from "formik";
import { Form } from "formik";
import { useState } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { PasswordFormField } from "src/components/formfields/PasswordFormField";
import { TitleContext } from "src/contexts/TitleContext";
import { UserService } from "src/services/UserService";
import { makeSentence } from "src/utils/string";
import { validatePassword } from "src/utils/validation";
import { validatePassword2 } from "src/utils/validation";
import { validateRequired } from "src/utils/validation";

interface PasswordResetFinishPageParams {
  token: string;
}

const PasswordResetFinishPage = () => {
  const { setTitle } = useContext(TitleContext);
  const { token } = (useParams() as unknown) as PasswordResetFinishPageParams;
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = useCallback(
    async (values, { setSubmitting, setStatus }) => {
      setStatus({});
      try {
        await UserService.completePasswordReset(values.password, token);
        setIsComplete(true);
      } catch (error) {
        setSubmitting(false);
        console.error(error);
        setStatus({ error: <>Unknown error.</> });
      }
    },
    [setIsComplete, token]
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
      password: [validatePassword, validateRequired],
      password2: [
        (source) => validatePassword2(source, values.password),
        validatePassword,
        validateRequired,
      ],
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
    <div className="PasswordResetFinishPage">
      <h1>Password Reset Finish</h1>

      {isComplete ? (
        <>
          Password reset complete. You may now <Link to={"/login"}>log in</Link>
          .
        </>
      ) : (
        <Formik
          initialValues={{ password: "", password2: "" }}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form>
              <FormGrid>
                <FormGridFieldSet>
                  <PasswordFormField
                    required={true}
                    label="Password"
                    name="password"
                  />
                  <PasswordFormField
                    required={true}
                    label="Password (repeat)"
                    name="password2"
                  />
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

export { PasswordResetFinishPage };

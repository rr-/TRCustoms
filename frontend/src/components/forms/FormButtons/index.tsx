import { useFormState } from "react-hook-form";
import styles from "src/components/common/FormGrid/index.module.css";
import type { FormResult } from "src/components/forms/useFormSubmit";

interface FormButtonsProps {
  result?: FormResult | null;
  extra?: React.ReactNode | undefined;
  children: React.ReactNode;
}

// The button row plus the submit-status area. Reuses FormGrid's styles so it
// matches the legacy FormGridButtons, but derives its error state from
// react-hook-form instead of Formik.
const FormButtons = ({ result, extra, children }: FormButtonsProps) => {
  const { errors } = useFormState();
  const hasFieldErrors = Object.keys(errors).length > 0;
  return (
    <div className={styles.buttons}>
      {(result?.success || result?.error || hasFieldErrors) && (
        <div className={styles.buttonsStatus}>
          {hasFieldErrors && (
            <div className="FormFieldError">
              Please review the errors above.
            </div>
          )}
          {result?.success && (
            <div className="FormFieldSuccess">{result.success}</div>
          )}
          {result?.error && (
            <div className="FormFieldError">{result.error}</div>
          )}
        </div>
      )}
      {extra && <div className={styles.buttonsExtra}>{extra}</div>}
      <div className={styles.buttonsWrapper}>{children}</div>
    </div>
  );
};

export { FormButtons };

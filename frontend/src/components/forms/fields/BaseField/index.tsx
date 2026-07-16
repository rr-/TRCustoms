import "./index.css";
import { FieldError } from "src/components/forms/fields/FieldError";

interface BaseFieldProps {
  name: string;
  label?: string | undefined;
  extraInformation?: React.ReactNode | undefined;
  required?: boolean | undefined;
  hideErrors?: boolean | undefined;
  children: React.ReactNode;
}

// The label + control + inline-error layout, shared by every field. Mirrors the
// legacy BaseFormField but reads its error from react-hook-form. Reuses the
// existing global .FormField styles so the markup is visually identical.
const BaseField = ({
  name,
  label,
  required,
  extraInformation,
  hideErrors,
  children,
}: BaseFieldProps) => (
  <div className="FormField">
    {label ? (
      <label className="FormField--label" htmlFor={name}>
        {label}
        {required && <>*</>}
        {!label.match(/[.?!:]$/) && <>:</>}
      </label>
    ) : null}
    <div className="FormField--field">
      {children}
      {extraInformation ? <div>{extraInformation}</div> : null}
      {!hideErrors && <FieldError name={name} />}
    </div>
  </div>
);

export type { BaseFieldProps };
export { BaseField };

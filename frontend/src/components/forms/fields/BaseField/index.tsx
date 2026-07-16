import "./index.css";
import { FieldError } from "src/components/forms/fields/FieldError";

interface BaseFieldProps {
  name: string;
  label?: string | undefined;
  extraInformation?: React.ReactNode | undefined;
  required?: boolean | undefined;
  hideErrors?: boolean | undefined;
  // Set for fields that render several controls (radios, tag/genre pickers)
  // rather than one input with id={name}: the label becomes a group caption
  // (role="group" + aria-labelledby) instead of a <label htmlFor> that would
  // point at a non-existent control.
  asGroup?: boolean | undefined;
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
  asGroup,
  children,
}: BaseFieldProps) => {
  const labelId = `${name}-label`;
  const labelText = label ? (
    <>
      {label}
      {required && <>*</>}
      {!label.match(/[.?!:]$/) && <>:</>}
    </>
  ) : null;

  return (
    <div
      className="FormField"
      role={asGroup ? "group" : undefined}
      aria-labelledby={asGroup && label ? labelId : undefined}
    >
      {labelText &&
        (asGroup ? (
          <span className="FormField--label" id={labelId}>
            {labelText}
          </span>
        ) : (
          <label className="FormField--label" htmlFor={name}>
            {labelText}
          </label>
        ))}
      <div className="FormField--field">
        {children}
        {extraInformation ? <div>{extraInformation}</div> : null}
        {!hideErrors && <FieldError name={name} />}
      </div>
    </div>
  );
};

export type { BaseFieldProps };
export { BaseField };

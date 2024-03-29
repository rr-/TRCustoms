import "./index.css";
import { FormFieldError } from "src/components/formfields/FormFieldError";

interface GenericFormFieldProps {
  name: string;
  label?: string | undefined;
  extraInformation?: React.ReactNode | string | undefined;
  required?: boolean | undefined;
  readonly?: boolean | undefined;
  hideErrors?: boolean | undefined;
}

interface BaseFormFieldProps extends GenericFormFieldProps {
  children: React.ReactNode;
}

const BaseFormField = ({
  required,
  name,
  label,
  extraInformation,
  children,
  hideErrors,
}: BaseFormFieldProps) => {
  return (
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
        {!hideErrors && <FormFieldError name={name} />}
      </div>
    </div>
  );
};

export type { GenericFormFieldProps };
export { BaseFormField };

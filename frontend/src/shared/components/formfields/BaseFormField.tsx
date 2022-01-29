import "./BaseFormField.css";
import { FormFieldError } from "src/shared/components/formfields/FormFieldError";

interface GenericFormFieldProps {
  name: string;
  label?: string | undefined;
  extraInformation?: string | undefined;
  required?: boolean | undefined;
  readonly?: boolean | undefined;
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
        <FormFieldError name={name} />
      </div>
    </div>
  );
};

export type { GenericFormFieldProps };
export { BaseFormField };

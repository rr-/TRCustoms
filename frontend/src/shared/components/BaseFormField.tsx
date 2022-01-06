import FormFieldError from "src/shared/components/FormFieldError";

interface GenericFormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  readonly?: boolean;
}

interface BaseFormFieldProps extends GenericFormFieldProps {
  children: React.ReactNode;
}

const BaseFormField = ({
  required,
  name,
  label,
  children,
}: BaseFormFieldProps) => {
  return (
    <div className="FormField">
      <label htmlFor={name}>
        {label}
        {required && <>*</>}:
      </label>
      {children}
      <FormFieldError name={name} />
    </div>
  );
};

export type { GenericFormFieldProps };
export default BaseFormField;

import FormFieldError from "src/shared/components/FormFieldError";

interface BaseFormFieldProps {
  required: boolean;
  name: string;
  label: string;
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

export default BaseFormField;

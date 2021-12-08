import FormFieldError from "src/shared/components/FormFieldError";

interface IBaseFormField {
  required: boolean;
  name: string;
  label: string;
  children: any;
}

const BaseFormField: React.FunctionComponent<IBaseFormField> = ({
  required,
  name,
  label,
  children,
}) => {
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

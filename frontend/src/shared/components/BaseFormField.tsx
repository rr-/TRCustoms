import FormFieldError from "src/shared/components/FormFieldError";

interface IBaseFormField {
  name: string;
  label: string;
  children: any;
}

const BaseFormField: React.FunctionComponent<IBaseFormField> = ({
  name,
  label,
  children,
}) => {
  return (
    <div className="FormField">
      <label htmlFor={name}>{label}:</label>
      {children}
      <FormFieldError name={name} />
    </div>
  );
};

export default BaseFormField;

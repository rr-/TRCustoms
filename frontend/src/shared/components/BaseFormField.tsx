import FormFieldError from "src/shared/components/FormFieldError";

interface IBaseFormField {
  name: string;
  label: string;
  render: any;
}

const BaseFormField: React.FunctionComponent<IBaseFormField> = ({
  name,
  label,
  render,
}) => {
  return (
    <div className="FormField">
      <label htmlFor={name}>{label}:</label>
      {render()}
      <FormFieldError name={name} />
    </div>
  );
};

export default BaseFormField;

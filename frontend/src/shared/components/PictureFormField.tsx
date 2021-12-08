import { useFormikContext } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface IPictureFormField {
  name: string;
  label: string;
  required?: boolean;
}

const PictureFormField: React.FunctionComponent<IPictureFormField> = ({
  name,
  label,
  required,
}) => {
  const { setFieldValue } = useFormikContext();

  return (
    <BaseFormField required={required} label={label} name={name}>
      <input
        name={name}
        type="file"
        onChange={(event) => {
          setFieldValue(name, event.currentTarget.files[0]);
        }}
      />
    </BaseFormField>
  );
};

export default PictureFormField;

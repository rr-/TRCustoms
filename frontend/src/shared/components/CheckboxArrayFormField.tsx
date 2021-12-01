import { Field } from "formik";
import { useFormikContext } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";

interface ICheckboxArrayFormField {
  name: string;
  label: string;
  source: Array<{ value: any; label: string }>;
}

const CheckboxArrayFormField: React.FunctionComponent<ICheckboxArrayFormField> = ({
  name,
  label,
  source,
}) => {
  const { values, setFieldValue } = useFormikContext();

  return (
    <BaseFormField name={name} label={label}>
      {source.map((item) => (
        <div key={item.value}>
          <label>
            <Field
              type="checkbox"
              onChange={(event) =>
                setFieldValue(
                  name,
                  event.target.checked
                    ? [...values[name], item.value]
                    : [...values[name].filter((elem) => elem !== item.value)]
                )
              }
              checked={values[name].includes(item.value)}
            />
            {item.label}
          </label>
        </div>
      ))}
    </BaseFormField>
  );
};

export default CheckboxArrayFormField;

import { Field } from "formik";
import { useFormikContext } from "formik";
import BaseFormField from "src/shared/components/BaseFormField";
import type { GenericFormFieldProps } from "src/shared/components/BaseFormField";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface CheckboxArrayFormFieldProps extends GenericFormFieldProps {
  source: Array<{ value: any; label: string }>;
}

const CheckboxArrayFormField = ({
  name,
  source,
  readonly,
  ...props
}: CheckboxArrayFormFieldProps) => {
  const { values, setFieldValue } = useFormikContext();

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      {source.length
        ? source.map((item) => (
            <div key={item.value}>
              <label>
                <Field
                  disabled={readonly}
                  type="checkbox"
                  onChange={(event) =>
                    setFieldValue(
                      name,
                      event.target.checked
                        ? [...values[name], item.value]
                        : [
                            ...values[name].filter(
                              (elem) => elem !== item.value
                            ),
                          ]
                    )
                  }
                  checked={values[name].includes(item.value)}
                />
                {item.label}
              </label>
            </div>
          ))
        : EMPTY_INPUT_PLACEHOLDER}
    </BaseFormField>
  );
};

export default CheckboxArrayFormField;

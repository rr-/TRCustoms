import { Field } from "formik";
import { useFormikContext } from "formik";
import { BaseFormField } from "src/shared/components/BaseFormField";
import type { GenericFormFieldProps } from "src/shared/components/BaseFormField";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface CheckboxArrayFormFieldProps<TValue> extends GenericFormFieldProps {
  source: Array<{ value: TValue; label: string }>;
}

const CheckboxArrayFormField = <TValue extends React.Key>({
  name,
  source,
  readonly,
  ...props
}: CheckboxArrayFormFieldProps<TValue>) => {
  const { values, setFieldValue } = useFormikContext() as {
    values: { [key: string]: any };
    setFieldValue: (name: string, value: any) => void;
  };

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      {source.length
        ? source.map((item) => (
            <div key={item.value}>
              <label>
                <Field
                  disabled={readonly}
                  type="checkbox"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setFieldValue(
                      name,
                      event.target.checked
                        ? [...values[name], item.value]
                        : [
                            ...values[name].filter(
                              (value: TValue) => value !== item.value
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

export { CheckboxArrayFormField };

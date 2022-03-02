import "./TextAreaFormField.css";
import { useFormikContext } from "formik";
import { Field } from "formik";
import { Markdown } from "src/components/Markdown";
import { TabSwitch } from "src/components/TabSwitch";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";

interface TextAreaFormFieldProps extends GenericFormFieldProps {
  validate?: (value: string) => string | null;
}

const TextAreaFormField = ({
  name,
  readonly,
  validate,
  ...props
}: TextAreaFormFieldProps) => {
  const { values } = useFormikContext();
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className="TextAreaFormField">
        <TabSwitch
          tabs={[
            {
              label: "Compose",
              content: (
                <Field
                  validate={validate}
                  disabled={readonly}
                  className="TextAreaFormField--textarea"
                  as="textarea"
                  type="text"
                  name={name}
                />
              ),
            },
            {
              label: "Preview",
              content: <Markdown>{(values as any)[name]}</Markdown>,
            },
          ]}
        />
      </div>
    </BaseFormField>
  );
};

export { TextAreaFormField };

import "./TextAreaFormField.css";
import { useFormikContext } from "formik";
import { Field } from "formik";
import { TabSwitch } from "src/components/TabSwitch";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { MarkdownComposer } from "src/components/markdown-composer/MarkdownComposer";
import { Markdown } from "src/components/markdown/Markdown";

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
                  name={name}
                  validate={validate}
                  readOnly={readonly}
                  component={MarkdownComposer}
                />
              ),
            },
            {
              label: "Preview",
              content: (
                <div className="TextAreaFormField--preview">
                  <Markdown>{(values as any)[name]}</Markdown>
                </div>
              ),
            },
          ]}
        />
      </div>
    </BaseFormField>
  );
};

export { TextAreaFormField };

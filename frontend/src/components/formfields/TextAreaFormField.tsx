import "./TextAreaFormField.css";
import { useFormikContext } from "formik";
import { Field } from "formik";
import { TabSwitch } from "src/components/TabSwitch";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { MarkdownComposer } from "src/components/markdown-composer/MarkdownComposer";
import { Markdown } from "src/components/markdown/Markdown";
import { useSettings } from "src/contexts/SettingsContext";
import { MarkdownPreviewMode } from "src/contexts/SettingsContext";

interface TextAreaFormFieldProps extends GenericFormFieldProps {
  rich?: boolean | undefined;
  allowAttachments?: boolean | undefined;
  validate?: (value: string) => string | null;
}

const TextAreaFormFieldTabbed = ({
  name,
  readonly,
  allowAttachments,
  validate,
  ...props
}: TextAreaFormFieldProps) => {
  const { values } = useFormikContext();
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className="TextAreaFormField tabbed">
        <TabSwitch
          tabs={[
            {
              label: "Compose",
              content: (
                <Field
                  name={name}
                  validate={validate}
                  readOnly={readonly}
                  allowAttachments={allowAttachments}
                  component={MarkdownComposer}
                />
              ),
            },
            {
              label: "Preview",
              content: (
                <div className="TextAreaFormField--preview">
                  <div className="TextAreaFormField--previewHeader">
                    Preview
                  </div>
                  <div className="TextAreaFormField--previewBody">
                    <Markdown>{(values as any)[name]}</Markdown>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </BaseFormField>
  );
};

const TextAreaFormFieldSide = ({
  name,
  readonly,
  allowAttachments,
  validate,
  ...props
}: TextAreaFormFieldProps) => {
  const { values } = useFormikContext();
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className="TextAreaFormField sideBySide">
        <Field
          name={name}
          validate={validate}
          readOnly={readonly}
          allowAttachments={allowAttachments}
          component={MarkdownComposer}
        />
        <div className="TextAreaFormField--preview">
          <div className="TextAreaFormField--previewHeader">Preview</div>
          <div className="TextAreaFormField--previewBody">
            <Markdown>{(values as any)[name]}</Markdown>
          </div>
        </div>
      </div>
    </BaseFormField>
  );
};

const TextAreaFormFieldPlain = ({
  name,
  readonly,
  allowAttachments,
  validate,
  ...props
}: TextAreaFormFieldProps) => {
  const { values } = useFormikContext();
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className="TextAreaFormField plain">
        <Field
          name={name}
          validate={validate}
          readOnly={readonly}
          as="textarea"
          className="TextArea--input Input"
        />
      </div>
    </BaseFormField>
  );
};

const TextAreaFormField = ({
  allowAttachments,
  rich,
  ...props
}: TextAreaFormFieldProps) => {
  if (allowAttachments === undefined) {
    allowAttachments = true;
  }

  const { markdownPreviewMode } = useSettings();
  if (!rich) {
    return <TextAreaFormFieldPlain {...props} />;
  }

  return markdownPreviewMode === MarkdownPreviewMode.Tabbed ? (
    <TextAreaFormFieldTabbed allowAttachments={allowAttachments} {...props} />
  ) : (
    <TextAreaFormFieldSide allowAttachments={allowAttachments} {...props} />
  );
};

export { TextAreaFormField };

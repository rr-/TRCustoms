import styles from "./index.module.css";
import { useFormikContext } from "formik";
import { Field } from "formik";
import { TabSwitch } from "src/components/common/TabSwitch";
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
      <div className={`${styles.wrapper} ${styles.tabbed}`}>
        <TabSwitch
          tabs={[
            {
              label: "Compose",
              content: (
                <div className={styles.tab}>
                  <Field
                    name={name}
                    validate={validate}
                    readOnly={readonly}
                    allowAttachments={allowAttachments}
                    component={MarkdownComposer}
                  />
                </div>
              ),
            },
            {
              label: "Preview",
              content: (
                <div className={styles.tab}>
                  <div className={styles.previewBody}>
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
      <div className={`${styles.wrapper} ${styles.sideBySide}`}>
        <Field
          name={name}
          validate={validate}
          readOnly={readonly}
          allowAttachments={allowAttachments}
          component={MarkdownComposer}
        />
        <div className={styles.preview}>
          <div className={styles.previewHeader}>Preview</div>
          <div className={styles.previewBody}>
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
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className={`${styles.wrapper} ${styles.plain}`}>
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

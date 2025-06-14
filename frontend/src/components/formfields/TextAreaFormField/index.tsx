import styles from "./index.module.css";
import { useFormikContext } from "formik";
import { Field } from "formik";
import { useState } from "react";
import type { TabPage } from "src/components/common/TabSwitch";
import { BoxedTabSwitch } from "src/components/common/TabSwitch";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { MarkdownComposer } from "src/components/markdown-composer/MarkdownComposer";
import { Markdown } from "src/components/markdown/Markdown";
import { useSettings } from "src/contexts/SettingsContext";
import { MarkdownPreviewMode } from "src/contexts/SettingsContext";

interface TextAreaFormFieldProps extends GenericFormFieldProps {
  rich?: boolean | undefined;
  allowColors?: boolean;
  allowSpoilers?: boolean;
  allowAttachments?: boolean;
  validate?: (value: string) => string | null;
}

const TextAreaFormFieldTabbed = ({
  name,
  readonly,
  allowColors,
  allowSpoilers,
  allowAttachments,
  validate,
  ...props
}: TextAreaFormFieldProps) => {
  const { values } = useFormikContext();
  const [tabName, setTabName] = useState("compose");

  const handleTabChange = (tab: TabPage) => {
    setTabName(tab.name);
  };

  const tabs = [
    {
      name: "compose",
      label: "Compose",
      content: (
        <div className={styles.tab}>
          <Field
            name={name}
            validate={validate}
            readOnly={readonly}
            allowColors={allowColors}
            allowSpoilers={allowSpoilers}
            allowAttachments={allowAttachments}
            component={MarkdownComposer}
          />
        </div>
      ),
    },

    {
      name: "preview",
      label: "Preview",
      content: (
        <div className={styles.tab}>
          <div className={styles.previewBody}>
            <div className={styles.markdownWrapper}>
              <Markdown allowColors={allowColors} allowSpoilers={allowSpoilers}>
                {(values as any)[name]}
              </Markdown>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className={`${styles.wrapper} ${styles.tabbed}`}>
        <BoxedTabSwitch
          tabs={tabs}
          tabName={tabName}
          onTabChange={handleTabChange}
        />
      </div>
    </BaseFormField>
  );
};

const TextAreaFormFieldSide = ({
  name,
  readonly,
  allowColors,
  allowSpoilers,
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
          allowColors={allowColors}
          allowSpoilers={allowSpoilers}
          allowAttachments={allowAttachments}
          component={MarkdownComposer}
        />
        <div className={styles.preview}>
          <div className={styles.previewHeader}>Preview</div>
          <div className={styles.previewBody}>
            <Markdown allowColors={allowColors} allowSpoilers={allowSpoilers}>
              {(values as any)[name]}
            </Markdown>
          </div>
        </div>
      </div>
    </BaseFormField>
  );
};

const TextAreaFormFieldPlain = ({
  name,
  readonly,
  allowColors,
  allowSpoilers,
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

const TextAreaFormField = ({ rich, ...props }: TextAreaFormFieldProps) => {
  props.allowAttachments ??= true;
  props.allowColors ??= true;
  props.allowSpoilers ??= true;

  const { markdownPreviewMode } = useSettings();
  if (!rich) {
    return <TextAreaFormFieldPlain {...props} />;
  }

  return markdownPreviewMode === MarkdownPreviewMode.Tabbed ? (
    <TextAreaFormFieldTabbed {...props} />
  ) : (
    <TextAreaFormFieldSide {...props} />
  );
};

export { TextAreaFormField };

import styles from "./index.module.css";
import { useFormikContext } from "formik";
import { Field } from "formik";
import { useContext } from "react";
import { useState } from "react";
import type { TabPage } from "src/components/common/TabSwitch";
import { BoxedTabSwitch } from "src/components/common/TabSwitch";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { MarkdownComposer } from "src/components/markdown-composer/MarkdownComposer";
import { Markdown } from "src/components/markdown/Markdown";
import { ConfigContext } from "src/contexts/ConfigContext";
import { useSettings } from "src/contexts/SettingsContext";
import { MarkdownPreviewMode } from "src/contexts/SettingsContext";
import type { MarkdownLimitKey } from "src/services/MarkdownLimitService";
import {
  getMarkdownLimit,
  getMarkdownLimitState,
  type MarkdownLimitState,
} from "src/services/MarkdownLimitService";

interface TextAreaFormFieldProps extends GenericFormFieldProps {
  rich?: boolean | undefined;
  allowColors?: boolean;
  allowAttachments?: boolean;
  markdownLimitKey?: MarkdownLimitKey;
  validate?: (value: string) => string | null;
}

interface MarkdownComposerFieldProps {
  name: string;
  readonly?: boolean;
  allowColors?: boolean;
  allowAttachments?: boolean;
  markdownLimitState?: MarkdownLimitState | null;
  showLimitInToolbar?: boolean;
  validate?: (value: string) => string | null;
}

const getTextAreaMarkdownLimitState = (
  values: Record<string, unknown>,
  config: React.ContextType<typeof ConfigContext>["config"],
  name: string,
  markdownLimitKey?: MarkdownLimitKey,
): MarkdownLimitState | null => {
  const limit = getMarkdownLimit(config, markdownLimitKey);
  const textValue = values[name];
  const text = typeof textValue === "string" ? textValue : "";
  return getMarkdownLimitState(text, limit);
};

const MarkdownComposerField = ({
  name,
  readonly,
  allowColors,
  allowAttachments,
  markdownLimitState,
  showLimitInToolbar,
  validate,
}: MarkdownComposerFieldProps) => {
  return (
    <Field
      name={name}
      validate={validate}
      readOnly={readonly}
      allowColors={allowColors}
      allowAttachments={allowAttachments}
      markdownLimitState={markdownLimitState}
      showLimitInToolbar={showLimitInToolbar}
      component={MarkdownComposer}
    />
  );
};

interface MarkdownLimitCounterProps {
  markdownLimitState: MarkdownLimitState | null;
}

const MarkdownLimitCounter = ({
  markdownLimitState,
}: MarkdownLimitCounterProps) => {
  if (!markdownLimitState?.shouldDisplay) {
    return null;
  }

  return (
    <div
      className={`${styles.counter} ${
        markdownLimitState.isOverLimit ? styles.counterOverLimit : ""
      }`}
    >
      {markdownLimitState.currentLength}/{markdownLimitState.limit}
    </div>
  );
};

const TextAreaFormFieldTabbed = ({
  name,
  readonly,
  allowColors,
  allowAttachments,
  markdownLimitKey,
  validate,
  ...props
}: TextAreaFormFieldProps) => {
  const { values } = useFormikContext();
  const { config } = useContext(ConfigContext);
  const [tabName, setTabName] = useState("compose");
  const markdownLimitState = getTextAreaMarkdownLimitState(
    values as Record<string, unknown>,
    config,
    name,
    markdownLimitKey,
  );

  const handleTabChange = (tab: TabPage) => {
    setTabName(tab.name);
  };

  const tabs = [
    {
      name: "compose",
      label: "Compose",
      content: (
        <div className={styles.tab}>
          <div className={styles.composeColumn}>
            <MarkdownComposerField
              name={name}
              validate={validate}
              readonly={readonly}
              allowColors={allowColors}
              allowAttachments={allowAttachments}
              markdownLimitState={markdownLimitState}
              showLimitInToolbar={true}
            />
          </div>
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
              <Markdown allowColors={allowColors}>
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
  allowAttachments,
  markdownLimitKey,
  validate,
  ...props
}: TextAreaFormFieldProps) => {
  const { values } = useFormikContext();
  const { config } = useContext(ConfigContext);
  const markdownLimitState = getTextAreaMarkdownLimitState(
    values as Record<string, unknown>,
    config,
    name,
    markdownLimitKey,
  );
  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className={`${styles.wrapper} ${styles.sideBySide}`}>
        <div className={styles.composeColumn}>
          <MarkdownComposerField
            name={name}
            validate={validate}
            readonly={readonly}
            allowColors={allowColors}
            allowAttachments={allowAttachments}
            markdownLimitState={markdownLimitState}
            showLimitInToolbar={false}
          />
        </div>
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <span>Preview</span>
            <MarkdownLimitCounter markdownLimitState={markdownLimitState} />
          </div>
          <div className={styles.previewBody}>
            <Markdown allowColors={allowColors}>
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

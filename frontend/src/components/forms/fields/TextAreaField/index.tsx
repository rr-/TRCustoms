import styles from "./index.module.css";
import { useContext } from "react";
import { useState } from "react";
import { useController } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { TabPage } from "src/components/common/TabSwitch";
import { BoxedTabSwitch } from "src/components/common/TabSwitch";
import { BaseField } from "src/components/forms/fields/BaseField";
import type { BaseFieldProps } from "src/components/forms/fields/BaseField";
import { MarkdownComposer } from "src/components/markdown-composer/MarkdownComposer";
import { Markdown } from "src/components/markdown/Markdown";
import { ConfigContext } from "src/contexts/ConfigContext";
import { useSettings } from "src/contexts/SettingsContext";
import { MarkdownPreviewMode } from "src/contexts/SettingsContext";
import type { MarkdownLimitKey } from "src/services/MarkdownLimitService";
import { getMarkdownLimit } from "src/services/MarkdownLimitService";
import { getMarkdownLimitState } from "src/services/MarkdownLimitService";
import type { MarkdownLimitState } from "src/services/MarkdownLimitService";

interface TextAreaFieldProps extends Omit<BaseFieldProps, "children"> {
  readonly?: boolean | undefined;
  rich?: boolean | undefined;
  allowColors?: boolean;
  allowAttachments?: boolean;
  markdownLimitKey?: MarkdownLimitKey;
}

const MarkdownLimitCounter = ({
  markdownLimitState,
}: {
  markdownLimitState: MarkdownLimitState | null;
}) => {
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

const RichTextAreaField = ({
  name,
  readonly,
  rich: _rich,
  allowColors,
  allowAttachments,
  markdownLimitKey,
  ...baseProps
}: TextAreaFieldProps) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  // Drop react-hook-form's ref: MarkdownComposer keeps its own ref on the
  // textarea (the toolbar reads it), and spreading a second ref would clobber
  // it. The bound value/onChange/onBlur/name are what the composer needs.
  const { ref: _ref, ...fieldProps } = field;
  const value = typeof field.value === "string" ? field.value : "";

  const { config } = useContext(ConfigContext);
  const { markdownPreviewMode } = useSettings();
  const [tabName, setTabName] = useState("compose");

  const markdownLimitState = getMarkdownLimitState(
    value,
    getMarkdownLimit(config, markdownLimitKey),
  );

  const composer = (showLimitInToolbar: boolean) => (
    <MarkdownComposer
      field={{ ...fieldProps, id: name, readOnly: readonly }}
      allowColors={allowColors}
      allowAttachments={allowAttachments}
      markdownLimitState={markdownLimitState}
      showLimitInToolbar={showLimitInToolbar}
    />
  );

  const preview = <Markdown allowColors={allowColors}>{value}</Markdown>;

  if (markdownPreviewMode === MarkdownPreviewMode.Tabbed) {
    const tabs: TabPage[] = [
      {
        name: "compose",
        label: "Compose",
        content: (
          <div className={styles.tab}>
            <div className={styles.composeColumn}>{composer(true)}</div>
          </div>
        ),
      },
      {
        name: "preview",
        label: "Preview",
        content: (
          <div className={styles.tab}>
            <div className={styles.previewBody}>
              <div className={styles.markdownWrapper}>{preview}</div>
            </div>
          </div>
        ),
      },
    ];
    return (
      <BaseField name={name} {...baseProps}>
        <div className={`${styles.wrapper} ${styles.tabbed}`}>
          <BoxedTabSwitch
            tabs={tabs}
            tabName={tabName}
            onTabChange={(tab: TabPage) => setTabName(tab.name)}
          />
        </div>
      </BaseField>
    );
  }

  return (
    <BaseField name={name} {...baseProps}>
      <div className={`${styles.wrapper} ${styles.sideBySide}`}>
        <div className={styles.composeColumn}>{composer(false)}</div>
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <span>Preview</span>
            <MarkdownLimitCounter markdownLimitState={markdownLimitState} />
          </div>
          <div className={styles.previewBody}>{preview}</div>
        </div>
      </div>
    </BaseField>
  );
};

const PlainTextAreaField = ({
  name,
  readonly,
  rich: _rich,
  allowColors: _allowColors,
  allowAttachments: _allowAttachments,
  markdownLimitKey: _markdownLimitKey,
  ...baseProps
}: TextAreaFieldProps) => {
  const { register } = useFormContext();
  return (
    <BaseField name={name} {...baseProps}>
      <div className={`${styles.wrapper} ${styles.plain}`}>
        <textarea
          id={name}
          {...register(name)}
          readOnly={readonly}
          className="TextArea--input Input"
        />
      </div>
    </BaseField>
  );
};

// react-hook-form port of TextAreaFormField: a plain textarea, or a rich
// Markdown composer with a live preview and character-limit counter.
const TextAreaField = ({ rich, ...props }: TextAreaFieldProps) => {
  props.allowAttachments ??= true;
  props.allowColors ??= true;
  return rich ? (
    <RichTextAreaField rich {...props} />
  ) : (
    <PlainTextAreaField {...props} />
  );
};

export type { TextAreaFieldProps };
export { TextAreaField };

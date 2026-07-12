import "./index.css";
import type { FieldInputProps } from "formik";
import { useRef } from "react";
import { MarkdownAttachmentStrip } from "src/components/markdown-composer/MarkdownAttachmentStrip";
import { MarkdownButtonStrip } from "src/components/markdown-composer/MarkdownButtonStrip";
import type { MarkdownLimitState } from "src/services/MarkdownLimitService";

interface MarkdownComposerProps {
  allowAttachments?: boolean;
  allowColors?: boolean;
  field: FieldInputProps<string>;
  form: any;
  markdownLimitState?: MarkdownLimitState | null;
  showLimitInToolbar?: boolean;
}

const MarkdownComposer = ({
  field,
  form,
  allowColors,
  allowAttachments,
  markdownLimitState,
  showLimitInToolbar,
  ...props
}: MarkdownComposerProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const textarea = ref.current;
  return (
    <div className="MarkdownComposer">
      <MarkdownButtonStrip
        allowColors={allowColors}
        markdownLimitState={showLimitInToolbar ? markdownLimitState : null}
        textarea={textarea}
      />
      <textarea
        ref={ref}
        className="TextArea--input Input"
        {...field}
        {...props}
      />
      {allowAttachments && <MarkdownAttachmentStrip textarea={textarea} />}
    </div>
  );
};

export { MarkdownComposer };

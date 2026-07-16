import "./index.css";
import { useRef } from "react";
import { MarkdownAttachmentStrip } from "src/components/markdown-composer/MarkdownAttachmentStrip";
import { MarkdownButtonStrip } from "src/components/markdown-composer/MarkdownButtonStrip";
import type { MarkdownLimitState } from "src/services/MarkdownLimitService";

// The bound input props the composer spreads onto its textarea (name, value,
// onChange, onBlur). Supplied by react-hook-form's useController.
interface FieldInputProps {
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
}

interface MarkdownComposerProps {
  allowAttachments?: boolean;
  allowColors?: boolean;
  field: FieldInputProps;
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

import "./index.css";
import type { FieldInputProps } from "formik";
import { useRef } from "react";
import { MarkdownAttachmentStrip } from "src/components/markdown-composer/MarkdownAttachmentStrip";
import { MarkdownButtonStrip } from "src/components/markdown-composer/MarkdownButtonStrip";

interface MarkdownComposerProps {
  allowAttachments?: boolean;
  allowColors?: boolean;
  field: FieldInputProps<string>;
  form: any;
}

const MarkdownComposer = ({
  field,
  form,
  allowColors,
  allowAttachments,
  ...props
}: MarkdownComposerProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const textarea = ref.current;
  return (
    <div className="MarkdownComposer">
      <MarkdownButtonStrip allowColors={allowColors} textarea={textarea} />
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

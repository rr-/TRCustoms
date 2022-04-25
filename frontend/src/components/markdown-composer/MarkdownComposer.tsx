import "./MarkdownComposer.css";
import type { FieldInputProps } from "formik";
import { useRef } from "react";
import { MarkdownButtonStrip } from "src/components/markdown-composer/MarkdownButtonStrip";

interface MarkdownComposerProps {
  field: FieldInputProps<string>;
  form: any;
}

const MarkdownComposer = ({ field, form, ...props }: MarkdownComposerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const textarea = ref.current?.querySelector("textarea");
  return (
    <div className="MarkdownComposer" ref={ref}>
      {textarea && <MarkdownButtonStrip textarea={textarea} />}
      <textarea className="TextArea--input Input" {...field} {...props} />
    </div>
  );
};

export { MarkdownComposer };

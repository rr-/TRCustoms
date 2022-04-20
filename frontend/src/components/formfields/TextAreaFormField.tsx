import "./TextAreaFormField.css";
import type { FieldInputProps } from "formik";
import { useFormikContext } from "formik";
import { Field } from "formik";
import { useRef } from "react";
import { useCallback } from "react";
import { Markdown } from "src/components/Markdown";
import { PushButton } from "src/components/PushButton";
import { TabSwitch } from "src/components/TabSwitch";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { IconMarkdownItalic } from "src/components/icons";
import { IconMarkdownCode } from "src/components/icons";
import { IconMarkdownQuote } from "src/components/icons";
import { IconMarkdownUnorderedList } from "src/components/icons";
import { IconMarkdownOrderedList } from "src/components/icons";
import { IconMarkdownLink } from "src/components/icons";
import { IconMarkdownImage } from "src/components/icons";
import { IconMarkdownBold } from "src/components/icons";
import { IconMarkdownHeader } from "src/components/icons";

interface MarkdownStyle {
  prefix: string;
  suffix: string;
  blockPrefix: string;
  blockSuffix: string;
  multiline: boolean;
  replaceNext: string;
  prefixSpace: boolean;
  scanFor: string;
  surroundWithNewlines: boolean;
  orderedList: boolean;
  unorderedList: boolean;
  trimFirst: boolean;
}

interface MarkdownInputStyle {
  prefix?: string | undefined;
  suffix?: string | undefined;
  blockPrefix?: string | undefined;
  blockSuffix?: string | undefined;
  multiline?: boolean | undefined;
  replaceNext?: string | undefined;
  prefixSpace?: boolean | undefined;
  scanFor?: string | undefined;
  surroundWithNewlines?: boolean | undefined;
  orderedList?: boolean | undefined;
  unorderedList?: boolean | undefined;
  trimFirst?: boolean | undefined;
}

interface MarkdownSelection {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

interface MarkdownListResult {
  text: string;
  processed: boolean;
}

const isMultipleLines = (text: string): boolean => {
  return text.trim().split("\n").length > 1;
};

const repeat = (text: string, n: number): string => {
  return Array(n + 1).join(text);
};

const wordSelectionStart = (text: string, i: number): number => {
  let index = i;
  while (
    text[index] &&
    text[index - 1] != null &&
    !text[index - 1].match(/\s/)
  ) {
    index--;
  }
  return index;
};

const wordSelectionEnd = (
  text: string,
  i: number,
  multiline: boolean
): number => {
  let index = i;
  const breakpoint = multiline ? /\n/ : /\s/;
  while (text[index] && !text[index].match(breakpoint)) {
    index++;
  }
  return index;
};

const insertText = (
  textarea: HTMLTextAreaElement,
  { text, selectionStart, selectionEnd }: MarkdownSelection
): void => {
  const originalSelectionStart = textarea.selectionStart;
  const before = textarea.value.slice(0, originalSelectionStart);
  const after = textarea.value.slice(textarea.selectionEnd);

  // fancy way of doing `textarea.value = before + text + after`
  // that triggers the change event listeners, so that Formik can keep up
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value"
  )?.set;
  const event = new Event("input", { bubbles: true });
  setValue?.call(textarea, before + text + after);
  textarea.dispatchEvent(event);

  if (selectionStart != null && selectionEnd != null) {
    textarea.setSelectionRange(selectionStart, selectionEnd);
  } else {
    textarea.setSelectionRange(originalSelectionStart, textarea.selectionEnd);
  }
};

const styleSelectedText = (
  textarea: HTMLTextAreaElement,
  style: MarkdownStyle
): void => {
  const text = textarea.value.slice(
    textarea.selectionStart,
    textarea.selectionEnd
  );
  let result;
  if (style.orderedList || style.unorderedList) {
    result = listStyle(textarea, style);
  } else if (style.multiline && isMultipleLines(text)) {
    result = multilineStyle(textarea, style);
  } else {
    result = blockStyle(textarea, style);
  }
  insertText(textarea, result);
};

const expandSelectionToLine = (textarea: HTMLTextAreaElement): void => {
  const lines = textarea.value.split("\n");
  let counter = 0;
  for (let index = 0; index < lines.length; index++) {
    const lineLength = lines[index].length + 1;
    if (
      textarea.selectionStart >= counter &&
      textarea.selectionStart < counter + lineLength
    ) {
      textarea.selectionStart = counter;
    }
    if (
      textarea.selectionEnd >= counter &&
      textarea.selectionEnd < counter + lineLength
    ) {
      textarea.selectionEnd = counter + lineLength - 1;
    }
    counter += lineLength;
  }
};

const expandSelectedText = (
  textarea: HTMLTextAreaElement,
  prefixToUse: string,
  suffixToUse: string,
  multiline: boolean = false
): string => {
  if (textarea.selectionStart === textarea.selectionEnd) {
    textarea.selectionStart = wordSelectionStart(
      textarea.value,
      textarea.selectionStart
    );
    textarea.selectionEnd = wordSelectionEnd(
      textarea.value,
      textarea.selectionEnd,
      multiline
    );
  } else {
    const expandedSelectionStart = textarea.selectionStart - prefixToUse.length;
    const expandedSelectionEnd = textarea.selectionEnd + suffixToUse.length;
    const beginsWithPrefix =
      textarea.value.slice(expandedSelectionStart, textarea.selectionStart) ===
      prefixToUse;
    const endsWithSuffix =
      textarea.value.slice(textarea.selectionEnd, expandedSelectionEnd) ===
      suffixToUse;
    if (beginsWithPrefix && endsWithSuffix) {
      textarea.selectionStart = expandedSelectionStart;
      textarea.selectionEnd = expandedSelectionEnd;
    }
  }
  return textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
};

const newlinesToSurroundSelectedText = (
  textarea: HTMLTextAreaElement
): { newlinesToAppend: string; newlinesToPrepend: string } => {
  const beforeSelection = textarea.value.slice(0, textarea.selectionStart);
  const afterSelection = textarea.value.slice(textarea.selectionEnd);
  const breaksBefore = beforeSelection.match(/\n*$/);
  const breaksAfter = afterSelection.match(/^\n*/);
  const newlinesBeforeSelection = breaksBefore ? breaksBefore[0].length : 0;
  const newlinesAfterSelection = breaksAfter ? breaksAfter[0].length : 0;
  let newlinesToAppend;
  let newlinesToPrepend;
  if (beforeSelection.match(/\S/) && newlinesBeforeSelection < 2) {
    newlinesToAppend = repeat("\n", 2 - newlinesBeforeSelection);
  }
  if (afterSelection.match(/\S/) && newlinesAfterSelection < 2) {
    newlinesToPrepend = repeat("\n", 2 - newlinesAfterSelection);
  }
  if (newlinesToAppend == null) {
    newlinesToAppend = "";
  }
  if (newlinesToPrepend == null) {
    newlinesToPrepend = "";
  }
  return { newlinesToAppend, newlinesToPrepend };
};

const blockStyle = (
  textarea: HTMLTextAreaElement,
  style: MarkdownStyle
): MarkdownSelection => {
  let newlinesToAppend;
  let newlinesToPrepend;
  const {
    prefix,
    suffix,
    blockPrefix,
    blockSuffix,
    replaceNext,
    prefixSpace,
    scanFor,
    surroundWithNewlines,
  } = style;
  const originalSelectionStart = textarea.selectionStart;
  const originalSelectionEnd = textarea.selectionEnd;
  let selectedText = textarea.value.slice(
    textarea.selectionStart,
    textarea.selectionEnd
  );
  let prefixToUse =
    isMultipleLines(selectedText) && blockPrefix.length > 0
      ? `${blockPrefix}\n`
      : prefix;
  let suffixToUse =
    isMultipleLines(selectedText) && blockSuffix.length > 0
      ? `\n${blockSuffix}`
      : suffix;
  if (prefixSpace) {
    const beforeSelection = textarea.value[textarea.selectionStart - 1];
    if (
      textarea.selectionStart !== 0 &&
      beforeSelection != null &&
      !beforeSelection.match(/\s/)
    ) {
      prefixToUse = ` ${prefixToUse}`;
    }
  }
  selectedText = expandSelectedText(
    textarea,
    prefixToUse,
    suffixToUse,
    style.multiline
  );
  let selectionStart = textarea.selectionStart;
  let selectionEnd = textarea.selectionEnd;
  const hasReplaceNext =
    replaceNext.length > 0 &&
    suffixToUse.indexOf(replaceNext) > -1 &&
    selectedText.length > 0;
  if (surroundWithNewlines) {
    const ref = newlinesToSurroundSelectedText(textarea);
    newlinesToAppend = ref.newlinesToAppend;
    newlinesToPrepend = ref.newlinesToPrepend;
    prefixToUse = newlinesToAppend + prefix;
    suffixToUse += newlinesToPrepend;
  }
  if (
    selectedText.startsWith(prefixToUse) &&
    selectedText.endsWith(suffixToUse)
  ) {
    const replacementText = selectedText.slice(
      prefixToUse.length,
      selectedText.length - suffixToUse.length
    );
    if (originalSelectionStart === originalSelectionEnd) {
      let position = originalSelectionStart - prefixToUse.length;
      position = Math.max(position, selectionStart);
      position = Math.min(position, selectionStart + replacementText.length);
      selectionStart = selectionEnd = position;
    } else {
      selectionEnd = selectionStart + replacementText.length;
    }
    return { text: replacementText, selectionStart, selectionEnd };
  } else if (!hasReplaceNext) {
    let replacementText = prefixToUse + selectedText + suffixToUse;
    selectionStart = originalSelectionStart + prefixToUse.length;
    selectionEnd = originalSelectionEnd + prefixToUse.length;
    const whitespaceEdges = selectedText.match(/^\s*|\s*$/g);
    if (style.trimFirst && whitespaceEdges) {
      const leadingWhitespace = whitespaceEdges[0] || "";
      const trailingWhitespace = whitespaceEdges[1] || "";
      replacementText =
        leadingWhitespace +
        prefixToUse +
        selectedText.trim() +
        suffixToUse +
        trailingWhitespace;
      selectionStart += leadingWhitespace.length;
      selectionEnd -= trailingWhitespace.length;
    }
    return { text: replacementText, selectionStart, selectionEnd };
  } else if (scanFor.length > 0 && selectedText.match(scanFor)) {
    suffixToUse = suffixToUse.replace(replaceNext, selectedText);
    const replacementText = prefixToUse + suffixToUse;
    selectionStart = selectionEnd = selectionStart + prefixToUse.length;
    return { text: replacementText, selectionStart, selectionEnd };
  } else {
    const replacementText = prefixToUse + selectedText + suffixToUse;
    selectionStart =
      selectionStart +
      prefixToUse.length +
      selectedText.length +
      suffixToUse.indexOf(replaceNext);
    selectionEnd = selectionStart + replaceNext.length;
    return { text: replacementText, selectionStart, selectionEnd };
  }
};

const multilineStyle = (
  textarea: HTMLTextAreaElement,
  style: MarkdownStyle
): MarkdownSelection => {
  const { prefix, suffix, surroundWithNewlines } = style;
  let text = textarea.value.slice(
    textarea.selectionStart,
    textarea.selectionEnd
  );
  let selectionStart = textarea.selectionStart;
  let selectionEnd = textarea.selectionEnd;
  const lines = text.split("\n");
  const undoStyle = lines.every(
    (line) => line.startsWith(prefix) && line.endsWith(suffix)
  );
  if (undoStyle) {
    text = lines
      .map((line) => line.slice(prefix.length, line.length - suffix.length))
      .join("\n");
    selectionEnd = selectionStart + text.length;
  } else {
    text = lines.map((line) => prefix + line + suffix).join("\n");
    if (surroundWithNewlines) {
      const {
        newlinesToAppend,
        newlinesToPrepend,
      } = newlinesToSurroundSelectedText(textarea);
      selectionStart += newlinesToAppend.length;
      selectionEnd = selectionStart + text.length;
      text = newlinesToAppend + text + newlinesToPrepend;
    }
  }
  return { text, selectionStart, selectionEnd };
};

const undoOrderedListStyle = (text: string): MarkdownListResult => {
  const lines = text.split("\n");
  const orderedListRegex = /^\d+\.\s+/;
  const shouldUndoOrderedList = lines.every((line) =>
    orderedListRegex.test(line)
  );
  let result = lines;
  if (shouldUndoOrderedList) {
    result = lines.map((line) => line.replace(orderedListRegex, ""));
  }
  return {
    text: result.join("\n"),
    processed: shouldUndoOrderedList,
  };
};

const undoUnorderedListStyle = (text: string): MarkdownListResult => {
  const lines = text.split("\n");
  const unorderedListPrefix = "- ";
  const shouldUndoUnorderedList = lines.every((line) =>
    line.startsWith(unorderedListPrefix)
  );
  let result = lines;
  if (shouldUndoUnorderedList) {
    result = lines.map((line) =>
      line.slice(unorderedListPrefix.length, line.length)
    );
  }
  return {
    text: result.join("\n"),
    processed: shouldUndoUnorderedList,
  };
};

const makePrefix = (index: number, unorderedList: boolean): string => {
  if (unorderedList) {
    return "- ";
  } else {
    return `${index + 1}. `;
  }
};

const clearExistingListStyle = (
  style: MarkdownStyle,
  selectedText: string
): [MarkdownListResult, MarkdownListResult, string] => {
  let undoResultOpositeList;
  let undoResult: MarkdownListResult;
  let pristineText;
  if (style.orderedList) {
    undoResult = undoOrderedListStyle(selectedText);
    undoResultOpositeList = undoUnorderedListStyle(undoResult.text);
    pristineText = undoResultOpositeList.text;
  } else {
    undoResult = undoUnorderedListStyle(selectedText);
    undoResultOpositeList = undoOrderedListStyle(undoResult.text);
    pristineText = undoResultOpositeList.text;
  }
  return [undoResult, undoResultOpositeList, pristineText];
};

const listStyle = (
  textarea: HTMLTextAreaElement,
  style: MarkdownStyle
): MarkdownSelection => {
  const noInitialSelection = textarea.selectionStart === textarea.selectionEnd;
  let selectionStart = textarea.selectionStart;
  let selectionEnd = textarea.selectionEnd;
  expandSelectionToLine(textarea);
  const selectedText = textarea.value.slice(
    textarea.selectionStart,
    textarea.selectionEnd
  );
  const [
    undoResult,
    undoResultOpositeList,
    pristineText,
  ] = clearExistingListStyle(style, selectedText);
  const prefixedLines = pristineText.split("\n").map((value, index) => {
    return `${makePrefix(index, style.unorderedList)}${value}`;
  });
  const totalPrefixLength = prefixedLines.reduce(
    (previousValue: number, _currentValue: string, currentIndex: number) => {
      return (
        previousValue + makePrefix(currentIndex, style.unorderedList).length
      );
    },
    0
  );
  const totalPrefixLengthOpositeList = prefixedLines.reduce(
    (previousValue: number, _currentValue: string, currentIndex: number) => {
      return (
        previousValue + makePrefix(currentIndex, !style.unorderedList).length
      );
    },
    0
  );
  if (undoResult.processed) {
    if (noInitialSelection) {
      selectionStart = Math.max(
        selectionStart - makePrefix(0, style.unorderedList).length,
        0
      );
      selectionEnd = selectionStart;
    } else {
      selectionStart = textarea.selectionStart;
      selectionEnd = textarea.selectionEnd - totalPrefixLength;
    }
    return { text: pristineText, selectionStart, selectionEnd };
  }
  const {
    newlinesToAppend,
    newlinesToPrepend,
  } = newlinesToSurroundSelectedText(textarea);
  const text = newlinesToAppend + prefixedLines.join("\n") + newlinesToPrepend;
  if (noInitialSelection) {
    selectionStart = Math.max(
      selectionStart +
        makePrefix(0, style.unorderedList).length +
        newlinesToAppend.length,
      0
    );
    selectionEnd = selectionStart;
  } else {
    if (undoResultOpositeList.processed) {
      selectionStart = Math.max(
        textarea.selectionStart + newlinesToAppend.length,
        0
      );
      selectionEnd =
        textarea.selectionEnd +
        newlinesToAppend.length +
        totalPrefixLength -
        totalPrefixLengthOpositeList;
    } else {
      selectionStart = Math.max(
        textarea.selectionStart + newlinesToAppend.length,
        0
      );
      selectionEnd =
        textarea.selectionEnd + newlinesToAppend.length + totalPrefixLength;
    }
  }
  return { text, selectionStart, selectionEnd };
};

interface MarkdownBaseButtonProps {
  textarea: HTMLTextAreaElement;
  tooltip: string;
  icon: React.ReactElement;
  style: MarkdownInputStyle;
}

const MarkdownBaseButton = ({
  icon,
  tooltip,
  textarea,
  style,
}: MarkdownBaseButtonProps) => {
  const handleClick = useCallback(() => {
    applyStyle(textarea, style);
  }, [textarea, style]);

  return (
    <PushButton
      disableTimeout={true}
      isPlain={true}
      onClick={handleClick}
      tooltip={tooltip}
    >
      {icon}
    </PushButton>
  );
};

interface MarkdownButtonProps {
  textarea: HTMLTextAreaElement;
}

const MarkdownHeaderButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownHeader />}
      tooltip="Add heading text"
      style={{ prefix: "###" }}
      {...props}
    />
  );
};

const MarkdownBoldButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownBold />}
      tooltip="Add bold text"
      style={{ prefix: "**", suffix: "**" }}
      {...props}
    />
  );
};

const MarkdownItalicButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownItalic />}
      tooltip="Add italic text"
      style={{ prefix: "_", suffix: "_", trimFirst: true }}
      {...props}
    />
  );
};

const MarkdownQuoteButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownQuote />}
      tooltip="Add a quote text"
      style={{ prefix: "> ", multiline: true, surroundWithNewlines: true }}
      {...props}
    />
  );
};

const MarkdownCodeButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownCode />}
      tooltip="Add code"
      style={{
        prefix: "`",
        suffix: "`",
        blockPrefix: "```",
        blockSuffix: "```",
      }}
      {...props}
    />
  );
};

const MarkdownLinkButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownLink />}
      tooltip="Add a link"
      style={{
        prefix: "[",
        suffix: "](url)",
        replaceNext: "url",
        scanFor: "https?://",
      }}
      {...props}
    />
  );
};

const MarkdownImageButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownImage />}
      tooltip="Add an image"
      style={{
        prefix: "![",
        suffix: "](url)",
        replaceNext: "url",
        scanFor: "https?://",
      }}
      {...props}
    />
  );
};

const MarkdownUnorderedListButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownUnorderedList />}
      tooltip="Add a bulleted list"
      style={{ prefix: "- ", multiline: true, unorderedList: true }}
      {...props}
    />
  );
};

const MarkdownOrderedListButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownOrderedList />}
      tooltip="Add a bulleted list"
      style={{ prefix: "1. ", multiline: true, orderedList: true }}
      {...props}
    />
  );
};

const applyStyle = (
  field: HTMLTextAreaElement,
  stylesToApply: MarkdownInputStyle
): void => {
  const defaults = {
    prefix: "",
    suffix: "",
    blockPrefix: "",
    blockSuffix: "",
    multiline: false,
    replaceNext: "",
    prefixSpace: false,
    scanFor: "",
    surroundWithNewlines: false,
    orderedList: false,
    unorderedList: false,
    trimFirst: false,
  };

  const style = Object.assign(Object.assign({}, defaults), stylesToApply);
  field.focus();
  styleSelectedText(field, style);
};

interface TextAreaProps {
  field: FieldInputProps<string>;
  form: any;
}

interface MarkdownButtonStripProps {
  textarea: HTMLTextAreaElement;
}

const MarkdownButtonStrip = ({ textarea }: MarkdownButtonStripProps) => {
  const buttonProps = { textarea };

  return (
    <div className="TextArea--buttonStrip">
      <div className="TextArea--buttonStripGroup">
        <MarkdownHeaderButton {...buttonProps} />
        <MarkdownBoldButton {...buttonProps} />
        <MarkdownItalicButton {...buttonProps} />
      </div>

      <div className="TextArea--buttonStripGroup">
        <MarkdownQuoteButton {...buttonProps} />
        <MarkdownCodeButton {...buttonProps} />
      </div>

      <div className="TextArea--buttonStripGroup">
        <MarkdownUnorderedListButton {...buttonProps} />
        <MarkdownOrderedListButton {...buttonProps} />
      </div>

      <div className="TextArea--buttonStripGroup">
        <MarkdownLinkButton {...buttonProps} />
        <MarkdownImageButton {...buttonProps} />
      </div>
    </div>
  );
};

const TextArea = ({ field, form, ...props }: TextAreaProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const textarea = ref.current?.querySelector("textarea");
  return (
    <div className="TextArea" ref={ref}>
      {textarea && <MarkdownButtonStrip textarea={textarea} />}
      <textarea className="TextArea--input Input" {...field} {...props} />
    </div>
  );
};

interface TextAreaPreviewProps {
  children: string;
}

const TextAreaPreview = ({ children }: TextAreaPreviewProps) => {
  return (
    <div className="TextAreaPreview">
      <Markdown>{children}</Markdown>
    </div>
  );
};

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
                  component={TextArea}
                />
              ),
            },
            {
              label: "Preview",
              content: (
                <TextAreaPreview>{(values as any)[name]}</TextAreaPreview>
              ),
            },
          ]}
        />
      </div>
    </BaseFormField>
  );
};

export { TextAreaFormField };

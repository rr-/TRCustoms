import styles from "./index.module.css";
import { useState } from "react";
import { useController } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { LinkTypeEnum } from "src/client";
import { Button } from "src/components/common/Button";
import { Link } from "src/components/common/Link";
import { BaseField } from "src/components/forms/fields/BaseField";
import type { BaseFieldProps } from "src/components/forms/fields/BaseField";
import { IconChevronDown } from "src/components/icons";
import { IconChevronUp } from "src/components/icons";
import { IconX } from "src/components/icons";
import { KEY_RETURN } from "src/constants";
import { formatLinkType } from "src/services/LevelService";
import { validateURL } from "src/utils/validation";

interface EditableExternalLink {
  id?: number;
  url: string;
  position: number;
  link_type: LinkTypeEnum;
}

const LINK_TYPES: LinkTypeEnum[] = ["sh", "ma"];

interface ExternalLinksFieldProps extends Omit<BaseFieldProps, "children"> {
  readonly?: boolean | undefined;
}

// react-hook-form port of ExternalLinksFormField: an editor for the ordered
// list of external links, bound to the field's array value.
const ExternalLinksField = ({
  name,
  readonly,
  ...baseProps
}: ExternalLinksFieldProps) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const value: EditableExternalLink[] = field.value || [];
  const [linkType, setLinkType] = useState<LinkTypeEnum>("sh");
  const [textInput, setTextInput] = useState("");
  const [textInputIsValid, setTextInputIsValid] = useState(false);

  const addCurrentLink = () => {
    if (
      textInputIsValid &&
      textInput &&
      !value
        .map((link) => link.url.toLowerCase())
        .includes(textInput.toLowerCase())
    ) {
      field.onChange([
        ...value,
        { url: textInput, position: value.length, link_type: linkType },
      ]);
      setTextInput("");
    }
  };

  const removeLink = (link: EditableExternalLink) => {
    field.onChange(value.filter((l) => l.url !== link.url));
  };

  const moveLinkUp = (link: EditableExternalLink) => {
    const newValue = [...value];
    const idx = value.findIndex((v) => v.url === link.url);
    newValue.splice(idx, 1);
    newValue.splice(idx - 1, 0, link);
    field.onChange(newValue);
  };

  const moveLinkDown = (link: EditableExternalLink) => {
    const newValue = [...value];
    const idx = value.findIndex((v) => v.url === link.url);
    newValue.splice(idx, 1);
    newValue.splice(idx + 1, 0, link);
    field.onChange(newValue);
  };

  const handleTextInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTextInput(event.target.value);
    setTextInputIsValid(event.target.checkValidity());
  };

  const handleTextInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.keyCode === KEY_RETURN) {
      event.preventDefault();
      addCurrentLink();
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen: string = event.target.selectedOptions?.[0].value;
    setLinkType(chosen as LinkTypeEnum);
  };

  return (
    <BaseField name={name} {...baseProps}>
      <div className={styles.entry}>
        <input
          className="Input"
          value={textInput}
          onChange={handleTextInputChange}
          onKeyDown={handleTextInputKeyDown}
          placeholder="Enter URL…"
          disabled={readonly}
        />

        <select
          className="Input"
          value={linkType}
          onChange={handleSelectChange}
          disabled={readonly}
        >
          {LINK_TYPES.map((linkType) => (
            <option key={linkType} value={linkType}>
              {formatLinkType(linkType)}
            </option>
          ))}
        </select>

        <Button disableTimeout={true} onClick={() => addCurrentLink()}>
          Add
        </Button>
      </div>

      <div className="FormFieldError">{validateURL(textInput)}</div>

      <table>
        <tbody>
          {value.map((link, i) => (
            <tr key={`${link.url}-${i}`}>
              <td>{link.url}</td>
              <td>{formatLinkType(link.link_type)}</td>
              <td>
                <Link
                  className={styles.tableButton}
                  onClick={() => removeLink(link)}
                >
                  <IconX />
                </Link>

                <Link
                  className={styles.tableButton}
                  disabled={i === 0}
                  onClick={() => moveLinkUp(link)}
                >
                  <IconChevronUp />
                </Link>

                <Link
                  className={styles.tableButton}
                  disabled={i === value.length - 1}
                  onClick={() => moveLinkDown(link)}
                >
                  <IconChevronDown />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </BaseField>
  );
};

export { ExternalLinksField };

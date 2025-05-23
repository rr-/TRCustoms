import styles from "./index.module.css";
import { useFormikContext } from "formik";
import { useState } from "react";
import { Button } from "src/components/common/Button";
import { Link } from "src/components/common/Link";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import { IconX } from "src/components/icons";
import { IconChevronDown } from "src/components/icons";
import { IconChevronUp } from "src/components/icons";
import { KEY_RETURN } from "src/constants";
import { formatLinkType } from "src/services/LevelService";
import type { ExternalLink } from "src/services/LevelService";
import { ExternalLinkType } from "src/services/LevelService";
import { validateURL } from "src/utils/validation";

interface ExternalLinksFormFieldProps extends GenericFormFieldProps {
  value: ExternalLink[];
  setValue: (value: ExternalLink[]) => void;
}

const ExternalLinksFormField = ({
  name,
  readonly,
  value,
  setValue,
  ...props
}: ExternalLinksFormFieldProps) => {
  const { setFieldTouched } = useFormikContext();
  const [linkType, setLinkType] = useState(ExternalLinkType.Showcase);
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
      setFieldTouched(name);
      setValue([
        ...value,
        { url: textInput, position: value.length, link_type: linkType },
      ]);
      setTextInput("");
    }
  };

  const removeLink = (link: ExternalLink) => {
    setFieldTouched(name);
    setValue(value.filter((l) => l.url !== link.url));
  };

  const moveLinkUp = (link: ExternalLink) => {
    const newValue = [...value];
    const idx = value.findIndex((v) => v.url === link.url);
    newValue.splice(idx, 1);
    newValue.splice(idx - 1, 0, link);
    setFieldTouched(name);
    setValue(newValue);
  };

  const moveLinkDown = (link: ExternalLink) => {
    const newValue = [...value];
    const idx = value.findIndex((v) => v.url === link.url);
    newValue.splice(idx, 1);
    newValue.splice(idx + 1, 0, link);
    setFieldTouched(name);
    setValue(newValue);
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
    setLinkType(chosen as ExternalLinkType);
  };

  const handleRemoveButtonClick = (link: ExternalLink) => {
    removeLink(link);
  };

  const handleMoveUpButtonClick = (link: ExternalLink) => {
    moveLinkUp(link);
  };

  const handleMoveDownButtonClick = (link: ExternalLink) => {
    moveLinkDown(link);
  };

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className={styles.entry}>
        <input
          className="Input"
          value={textInput}
          onChange={handleTextInputChange}
          onKeyDown={handleTextInputKeyDown}
          placeholder="Enter URL…"
        />

        <select
          className="Input"
          value={linkType}
          onChange={handleSelectChange}
        >
          {Object.values(ExternalLinkType).map((linkType) => (
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
                  onClick={() => handleRemoveButtonClick(link)}
                >
                  <IconX />
                </Link>

                <Link
                  className={styles.tableButton}
                  disabled={i === 0}
                  onClick={() => handleMoveUpButtonClick(link)}
                >
                  <IconChevronUp />
                </Link>

                <Link
                  className={styles.tableButton}
                  disabled={i === value.length - 1}
                  onClick={() => handleMoveDownButtonClick(link)}
                >
                  <IconChevronDown />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </BaseFormField>
  );
};

export { ExternalLinksFormField };

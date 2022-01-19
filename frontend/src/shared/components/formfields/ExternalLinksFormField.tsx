import "./ExternalLinksFormField.css";
import { XIcon } from "@heroicons/react/outline";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { ChevronUpIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { formatLinkType } from "src/services/level.service";
import type { ExternalLink } from "src/services/level.service";
import { ExternalLinkType } from "src/services/level.service";
import { PushButton } from "src/shared/components/PushButton";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import { KEY_RETURN } from "src/shared/constants";

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
      setValue([
        ...value,
        { url: textInput, position: value.length, link_type: linkType },
      ]);
      setTextInput("");
    }
  };

  const onTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(event.target.value);
    setTextInputIsValid(event.target.checkValidity());
  };

  const onTextInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === KEY_RETURN) {
      event.preventDefault();
      addCurrentLink();
    }
  };

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen: string = event.target.selectedOptions?.[0].value;
    setLinkType(chosen as ExternalLinkType);
  };

  const onRemoveButtonClick = (link: ExternalLink) => {
    setValue(value.filter((l) => l.url !== link.url));
  };

  const onMoveUpButtonClick = (link: ExternalLink) => {
    const newValue = [...value];
    const idx = value.findIndex((v) => v.url === link.url);
    newValue.splice(idx, 1);
    newValue.splice(idx - 1, 0, link);
    setValue(newValue);
  };

  const onMoveDownButtonClick = (link: ExternalLink) => {
    const newValue = [...value];
    const idx = value.findIndex((v) => v.url === link.url);
    newValue.splice(idx, 1);
    newValue.splice(idx + 1, 0, link);
    setValue(newValue);
  };

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className="ExternalLinksFormField--entry">
        <input
          className="ExternalLinksFormField--input"
          type="url"
          value={textInput}
          onChange={onTextInputChange}
          onKeyDown={onTextInputKeyDown}
          placeholder="Enter URL…"
        />

        <select
          className="ExternalLinksFormField--select"
          value={linkType}
          onChange={onSelectChange}
        >
          {Object.values(ExternalLinkType).map((linkType) => (
            <option key={linkType} value={linkType}>
              {formatLinkType(linkType)}
            </option>
          ))}
        </select>

        <PushButton disableTimeout={true} onClick={() => addCurrentLink()}>
          Add
        </PushButton>
      </div>

      <table className="ExternalLinksFormField--table">
        <tbody>
          {value.map((link, i) => (
            <tr key={`${link.url}-${i}`}>
              <td>{link.url}</td>
              <td>{formatLinkType(link.link_type)}</td>
              <td>
                <PushButton
                  disableTimeout={true}
                  isPlain={true}
                  onClick={() => onRemoveButtonClick(link)}
                >
                  <XIcon className="icon" />
                </PushButton>

                <PushButton
                  disabled={i === 0}
                  disableTimeout={true}
                  isPlain={true}
                  onClick={() => onMoveUpButtonClick(link)}
                >
                  <ChevronUpIcon className="icon" />
                </PushButton>

                <PushButton
                  disabled={i === value.length - 1}
                  disableTimeout={true}
                  isPlain={true}
                  onClick={() => onMoveDownButtonClick(link)}
                >
                  <ChevronDownIcon className="icon" />
                </PushButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </BaseFormField>
  );
};

export { ExternalLinksFormField };

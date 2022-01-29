import "./AutoComplete.css";
import { useCallback } from "react";
import { Key } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { PushButton } from "src/shared/components/PushButton";
import { TextInput } from "src/shared/components/TextInput";
import { KEY_RETURN } from "src/shared/constants";
import { KEY_UP } from "src/shared/constants";
import { KEY_DOWN } from "src/shared/constants";

interface AutoCompleteProps<TItem> {
  maxLength?: number | undefined;
  suggestions: TItem[];
  getResultText: (result: TItem) => string;
  getResultKey: (result: TItem) => Key;
  onSearchTrigger: (textInput: string) => void;
  onResultApply: (result: TItem) => void;
  onNewResultApply?: ((textInput: string) => void) | undefined;
}

const AutoComplete = <TItem extends Object>({
  maxLength,
  suggestions,
  getResultText,
  getResultKey,
  onSearchTrigger,
  onResultApply,
  onNewResultApply,
}: AutoCompleteProps<TItem>) => {
  const [activeResultIdx, setActiveResultIdx] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    if (!suggestions.length) {
      setShowResults(false);
    } else {
      setShowResults(true);
      if (activeResultIdx < 0) {
        setActiveResultIdx(0);
      }
      if (activeResultIdx > suggestions.length) {
        setActiveResultIdx(suggestions.length - 1);
      }
    }
  }, [suggestions, activeResultIdx, setActiveResultIdx, setShowResults]);

  useEffect(() => {
    onSearchTrigger(textInput);
  }, [textInput, onSearchTrigger]);

  const applyResult = useCallback(() => {
    const selectedResult = suggestions[activeResultIdx] || null;
    if (selectedResult) {
      if (onResultApply) {
        onResultApply(selectedResult);
        setTextInput("");
      } else {
        setTextInput(getResultText(selectedResult));
      }
    } else if (onNewResultApply) {
      onNewResultApply(textInput);
      setTextInput("");
    }
    setActiveResultIdx(0);
    setShowResults(false);
  }, [
    activeResultIdx,
    getResultText,
    onNewResultApply,
    onResultApply,
    suggestions,
    textInput,
  ]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(event.target.value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setTextInput((event.target as HTMLInputElement).value);
    if (event.keyCode === KEY_RETURN) {
      event.preventDefault();
      applyResult();
    } else if (suggestions.length) {
      if (event.keyCode === KEY_UP) {
        if (activeResultIdx - 1 > 0) {
          setActiveResultIdx(activeResultIdx - 1);
        }
      } else if (event.keyCode === KEY_DOWN) {
        if (activeResultIdx - 1 < suggestions.length) {
          setActiveResultIdx(activeResultIdx + 1);
        }
      }
    }
  };

  const handleAddButtonClick = () => {
    if (textInput) {
      applyResult();
    }
  };

  const handleSuggestionMouseDown = (
    event: React.MouseEvent<HTMLLIElement>
  ) => {
    if (!suggestions.length) {
      return;
    }
    setActiveResultIdx(
      +((event.target as HTMLLIElement).getAttribute("data-index") || "")
    );
  };

  const handleSuggestionMouseUp = (event: React.MouseEvent<HTMLLIElement>) => {
    if (activeResultIdx >= 0) {
      applyResult();
    }
  };

  const AutoCompleteSuggestions = () => {
    return (
      <div className="AutoCompleteSuggestions">
        {suggestions.length ? (
          <ul className="AutoCompleteSuggestions--list">
            {suggestions.map((result, index) => {
              let classNames = ["AutoCompleteSuggestions--listItem"];
              if (index === activeResultIdx) {
                classNames.push("active");
              }
              return (
                <li
                  className={classNames.join(" ")}
                  key={getResultKey(result)}
                  data-index={index}
                  onMouseDown={handleSuggestionMouseDown}
                  onMouseUp={handleSuggestionMouseUp}
                >
                  {getResultText(result)}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="AutoCompleteSuggestions--empty">No suggestions.</div>
        )}
      </div>
    );
  };

  return (
    <div className="AutoComplete">
      <TextInput
        maxLength={maxLength}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        value={textInput}
        placeholder="Start typing to search…"
      />
      {showResults && textInput && <AutoCompleteSuggestions />}
      {onNewResultApply && (
        <PushButton disabled={!textInput.length} onClick={handleAddButtonClick}>
          Add new
        </PushButton>
      )}
    </div>
  );
};

export { AutoComplete };

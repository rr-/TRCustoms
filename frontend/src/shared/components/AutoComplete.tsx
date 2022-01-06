import "./AutoComplete.css";
import { Key } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { KEY_RETURN } from "src/shared/constants";
import { KEY_UP } from "src/shared/constants";
import { KEY_DOWN } from "src/shared/constants";

interface AutoCompleteProps<TItem> {
  suggestions: TItem[] | null;
  getResultText: (result: TItem) => string;
  getResultKey: (result: TItem) => Key;
  onSearchTrigger: (userInput: string) => void;
  onResultApply: (result: TItem) => void;
  onNewResultApply?: (userInput: string) => any | null;
}

const AutoComplete = <TItem extends Object>({
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
    if (suggestions === null) {
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

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = event.target.value;
    setTextInput(userInput);
    onSearchTrigger(userInput);
  };

  const applyResult = (userInput: string, selectedResult: TItem | null) => {
    if (selectedResult) {
      if (onResultApply) {
        onResultApply(selectedResult);
        setTextInput("");
      } else {
        setTextInput(getResultText(selectedResult));
      }
    } else if (onNewResultApply) {
      onNewResultApply(userInput);
      setTextInput("");
    }
    setActiveResultIdx(0);
    setShowResults(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const userInput = (event.target as HTMLInputElement).value;
    if (event.keyCode === KEY_RETURN) {
      event.preventDefault();
      if (suggestions !== null) {
        applyResult(userInput, suggestions[activeResultIdx] || null);
      }
    } else if (suggestions !== null) {
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

  const onClick = (event: React.MouseEvent<HTMLLIElement>) => {
    if (suggestions === null) {
      return;
    }
    const index = +(
      (event.target as HTMLLIElement).getAttribute("data-index") || ""
    );
    applyResult(textInput, suggestions[index]);
  };

  const AutoCompleteSuggestions = () => {
    return (
      <div className="AutoCompleteSuggestions">
        {suggestions?.length ? (
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
                  onClick={onClick}
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
    <>
      <input
        className="AutoComplete--input"
        type="text"
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={textInput}
        placeholder="Start typing to search…"
      />
      {showResults && textInput && <AutoCompleteSuggestions />}
    </>
  );
};

export { AutoComplete };

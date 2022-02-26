import "./Pills.css";
import { XIcon } from "@heroicons/react/outline";
import { Key } from "react";
import { PushButton } from "src/components/PushButton";

interface PillsProps<TItem> {
  source: TItem[];
  getKey: (item: TItem) => Key;
  getText: (item: TItem) => string;
  onRemove: (item: TItem) => void;
}

const Pills = <TItem extends Object>({
  source,
  getKey,
  getText,
  onRemove,
}: PillsProps<TItem>) => {
  return (
    <div className="Pills">
      {source.length ? (
        <ul className="Pills--list">
          {source.map((item) => (
            <li key={getKey(item)} className="Pills--listItem">
              {getText(item)}{" "}
              <PushButton isPlain={true} onClick={() => onRemove(item)}>
                <XIcon className="icon" />
              </PushButton>
            </li>
          ))}
        </ul>
      ) : (
        <>Nothing selected</>
      )}
    </div>
  );
};

export { Pills };

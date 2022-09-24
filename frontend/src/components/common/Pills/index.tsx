import "./index.css";
import { Key } from "react";
import { Button } from "src/components/common/Button";
import { IconX } from "src/components/icons";

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
              <Button isPlain={true} onClick={() => onRemove(item)}>
                <IconX />
              </Button>
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

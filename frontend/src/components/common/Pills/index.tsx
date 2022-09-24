import styles from "./index.module.css";
import { Key } from "react";
import { Link } from "src/components/common/Link";
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
    <div className={styles.pills}>
      {source.length ? (
        <ul className={styles.list}>
          {source.map((item) => (
            <li key={getKey(item)} className={styles.listItem}>
              {getText(item)}{" "}
              <Link
                className={styles.removeLink}
                onClick={() => onRemove(item)}
              >
                <IconX />
              </Link>
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

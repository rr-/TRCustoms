import styles from "./index.module.css";
import { SectionHeader } from "src/components/common/Section";

interface LegaleseEntry {
  title?: string | undefined;
  description?: React.ReactNode | string | undefined;
  bullets?: boolean | undefined;
  children?: LegaleseEntry[] | undefined;
}

interface LegaleseItemProps {
  prefix: string;
  parent?: LegaleseEntry | undefined;
  entry: LegaleseEntry;
  currentNumber: number[];
}

const LegaleseItem = ({
  prefix,
  entry,
  parent,
  currentNumber,
}: LegaleseItemProps) => {
  const childElems = entry.children?.map((subEntry, i) => (
    <li className={styles.listItem} key={i}>
      <LegaleseItem
        prefix={prefix}
        parent={entry}
        entry={subEntry}
        currentNumber={[...currentNumber, i + 1]}
      />
    </li>
  ));

  const formattedNumber = parent?.bullets
    ? "\u25cf"
    : currentNumber.length
      ? currentNumber.join(".") + "."
      : "";

  return (
    <div
      data-nesting={currentNumber.length}
      className={styles.wrapper}
      id={`${prefix}--${currentNumber.join(".")}`}
    >
      {currentNumber.length === 1 ? (
        <div className={styles.body}>
          <SectionHeader>
            {formattedNumber} {entry.title}
          </SectionHeader>
          {entry.description && <p>{entry.description}</p>}
          {childElems && <ul className={styles.list}>{childElems}</ul>}
        </div>
      ) : (
        <>
          <div className={styles.number}>{formattedNumber}</div>
          <div className={styles.body}>
            {entry.title && <span>{entry.title}</span>}
            {entry.description && <p>{entry.description}</p>}
            {childElems && <ul className={styles.list}>{childElems}</ul>}
          </div>
        </>
      )}
    </div>
  );
};

export type { LegaleseItemProps };
export type { LegaleseEntry };
export { LegaleseItem };

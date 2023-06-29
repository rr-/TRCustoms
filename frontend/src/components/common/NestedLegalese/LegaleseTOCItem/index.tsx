import type { LegaleseItemProps } from "../LegaleseItem";

const LegaleseTOCItem = ({
  prefix,
  entry,
  currentNumber,
}: LegaleseItemProps) => {
  const children = entry?.children?.filter((subEntry) => !!subEntry.title);
  const childElems = children?.map((subEntry, i) => (
    <li key={i}>
      <LegaleseTOCItem
        prefix={prefix}
        parent={entry}
        entry={subEntry}
        currentNumber={[...currentNumber, i + 1]}
      />
    </li>
  ));
  return (
    <div>
      {entry.title && (
        <a href={`#${prefix}--${currentNumber.join(".")}`}>{entry.title}</a>
      )}
      {!entry.bullets &&
        childElems &&
        (entry.bullets ? <ul>{childElems}</ul> : <ol>{childElems}</ol>)}
    </div>
  );
};

export { LegaleseTOCItem };

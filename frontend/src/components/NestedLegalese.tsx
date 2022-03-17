import "./NestedLegalese.css";

interface LegaleseEntry {
  title?: string | undefined;
  description?: React.ReactNode | string | undefined;
  bullets?: boolean | undefined;
  children?: LegaleseEntry[] | undefined;
}

interface LegaleseItemProps {
  entry: LegaleseEntry;
  nesting: number;
  currentNumber?: string | undefined;
}

const LegaleseItem = ({ entry, nesting, currentNumber }: LegaleseItemProps) => {
  const childElems = entry.children?.map((subitem, i) => (
    <li className="LegaleseItem--listItem" key={i}>
      <LegaleseItem
        entry={subitem}
        nesting={nesting + 1}
        currentNumber={`${currentNumber || ""}.${i + 1}`}
      />
    </li>
  ));
  return (
    <div
      data-nesting={nesting}
      className="LegaleseItem"
      id={`tos${currentNumber || ""}`}
    >
      {entry.title && (
        <span className="LegaleseItem--title">{entry.title}</span>
      )}
      {entry.description && (
        <p className="LegaleseItem--description">{entry.description}</p>
      )}
      {childElems &&
        (entry.bullets ? (
          <ul className="LegaleseItem--list">{childElems}</ul>
        ) : (
          <ol className="LegaleseItem--list">{childElems}</ol>
        ))}
    </div>
  );
};

const LegaleseTOCItem = ({
  entry,
  nesting,
  currentNumber,
}: LegaleseItemProps) => {
  const children = entry?.children?.filter((subitem) => !!subitem.title);
  const childElems = children?.map((subitem, i) => (
    <li key={i}>
      <LegaleseTOCItem
        entry={subitem}
        nesting={nesting + 1}
        currentNumber={`${currentNumber || ""}.${i + 1}`}
      />
    </li>
  ));
  return (
    <div className="LegaleseTOCItem">
      {entry.title && <a href={`#tos${currentNumber || ""}`}>{entry.title}</a>}
      {!entry.bullets &&
        childElems &&
        (entry.bullets ? <ul>{childElems}</ul> : <ol>{childElems}</ol>)}
    </div>
  );
};

interface NestedLegaleseProps {
  entry: LegaleseEntry;
}

const NestedLegalese = ({ entry }: NestedLegaleseProps) => {
  return (
    <div className="NestedLegalese--wrapper">
      <aside className="NestedLegalese--toc">
        <strong>Table of Contents</strong>
        <LegaleseTOCItem nesting={0} entry={entry} />
      </aside>

      <div className="NestedLegalese--content">
        <LegaleseItem nesting={0} entry={entry} />
      </div>
    </div>
  );
};

export { NestedLegalese };
export type { LegaleseEntry };

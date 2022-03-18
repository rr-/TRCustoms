import "./NestedLegalese.css";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";

interface LegaleseEntry {
  title?: string | undefined;
  description?: React.ReactNode | string | undefined;
  bullets?: boolean | undefined;
  children?: LegaleseEntry[] | undefined;
}

interface LegaleseItemProps {
  parent?: LegaleseEntry | undefined;
  entry: LegaleseEntry;
  currentNumber: number[];
}

const LegaleseItem = ({ entry, parent, currentNumber }: LegaleseItemProps) => {
  const childElems = entry.children?.map((subEntry, i) => (
    <li className="LegaleseItem--listItem" key={i}>
      <LegaleseItem
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
      className="LegaleseItem"
      id={`tos-${currentNumber.join(".")}`}
    >
      {currentNumber.length === 1 ? (
        <div className="LegaleseItem--body">
          <SectionHeader className="LegaleseItem--title">
            {formattedNumber} {entry.title}
          </SectionHeader>
          {entry.description && (
            <p className="LegaleseItem--description">{entry.description}</p>
          )}
          {childElems && <ul className="LegaleseItem--list">{childElems}</ul>}
        </div>
      ) : (
        <>
          <div className="LegaleseItem--number">{formattedNumber}</div>
          <div className="LegaleseItem--body">
            {entry.title && (
              <span className="LegaleseItem--title">{entry.title}</span>
            )}
            {entry.description && (
              <p className="LegaleseItem--description">{entry.description}</p>
            )}
            {childElems && <ul className="LegaleseItem--list">{childElems}</ul>}
          </div>
        </>
      )}
    </div>
  );
};

const LegaleseTOCItem = ({ entry, currentNumber }: LegaleseItemProps) => {
  const children = entry?.children?.filter((subEntry) => !!subEntry.title);
  const childElems = children?.map((subEntry, i) => (
    <li key={i}>
      <LegaleseTOCItem
        parent={entry}
        entry={subEntry}
        currentNumber={[...currentNumber, i + 1]}
      />
    </li>
  ));
  return (
    <div className="LegaleseTOCItem">
      {entry.title && (
        <a href={`#tos-${currentNumber.join(".")}`}>{entry.title}</a>
      )}
      {!entry.bullets &&
        childElems &&
        (entry.bullets ? <ul>{childElems}</ul> : <ol>{childElems}</ol>)}
    </div>
  );
};

interface NestedLegaleseProps {
  title?: string | undefined;
  entry: LegaleseEntry;
}

const NestedLegalese = ({ title, entry }: NestedLegaleseProps) => {
  return (
    <div className="NestedLegalese--wrapper">
      <aside className="NestedLegalese--toc">
        <SidebarBox>
          <SectionHeader>Table of Contents</SectionHeader>
          <LegaleseTOCItem currentNumber={[]} entry={entry} />
        </SidebarBox>
      </aside>

      <div className="NestedLegalese--content">
        {title && <h1>{title}</h1>}
        <LegaleseItem currentNumber={[]} entry={entry} />
      </div>
    </div>
  );
};

export { NestedLegalese };
export type { LegaleseEntry };

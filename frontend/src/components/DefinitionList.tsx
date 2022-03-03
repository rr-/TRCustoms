import "./DefinitionList.css";

interface DefinitionItemGroupProps {
  children: React.ReactNode;
}

const DefinitionItemGroup = ({ children }: DefinitionItemGroupProps) => {
  return <div className="DefinitionItemGroup">{children}</div>;
};
interface DefinitionItemProps {
  span?: boolean | undefined;
  term?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const DefinitionItem = ({ span, term, children }: DefinitionItemProps) => {
  return (
    <div className={`DefinitionItem ${span ? "span" : ""}`}>
      {term && <div className="DefinitionItem--term">{term}</div>}
      <div className="DefinitionItem--value">{children}</div>
    </div>
  );
};

interface DefinitionListProps {
  children: React.ReactNode;
}

const DefinitionList = ({ children }: DefinitionListProps) => {
  return <div className="DefinitionList">{children}</div>;
};

export { DefinitionItem, DefinitionItemGroup, DefinitionList };

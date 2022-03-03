import "./DefinitionList.css";

interface DefinitionItemGroupProps {
  children: React.ReactNode;
}

const DefinitionItemGroup = ({ children }: DefinitionItemGroupProps) => {
  return <div className="DefinitionItemGroup">{children}</div>;
};
interface DefinitionItemProps {
  term: string;
  children: React.ReactNode;
}

const DefinitionItem = ({ term, children }: DefinitionItemProps) => {
  return (
    <div className="DefinitionItem">
      <div className="DefinitionItem--term">{term}</div>
      <div className="DefinitionItem--value">{children}</div>
    </div>
  );
};

interface DefinitionListProps {
  children: React.ReactElement<typeof DefinitionItem>[];
}

const DefinitionList = ({ children }: DefinitionListProps) => {
  return <div className="DefinitionList">{children}</div>;
};

export { DefinitionItem, DefinitionItemGroup, DefinitionList };

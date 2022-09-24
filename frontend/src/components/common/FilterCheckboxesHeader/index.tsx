import "./index.css";
import { Button } from "src/components/common/Button";

interface FilterCheckboxesHeaderProps {
  onClear: () => void;
  children: React.ReactNode;
}
const FilterCheckboxesHeader = ({
  onClear,
  children,
}: FilterCheckboxesHeaderProps) => {
  return (
    <div className="FilterCheckboxesHeader">
      {children}
      <Button isPlain={true} disableTimeout={true} onClick={onClear}>
        (clear)
      </Button>
    </div>
  );
};

export { FilterCheckboxesHeader };

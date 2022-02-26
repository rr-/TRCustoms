import "./FilterCheckboxesHeader.css";
import { PushButton } from "src/components/PushButton";

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
      <PushButton isPlain={true} disableTimeout={true} onClick={onClear}>
        (clear)
      </PushButton>
    </div>
  );
};

export { FilterCheckboxesHeader };

import styles from "./index.module.css";
import { Link } from "src/components/common/Link";

interface FilterCheckboxesHeaderProps {
  onClear: () => void;
  children: React.ReactNode;
}
const FilterCheckboxesHeader = ({
  onClear,
  children,
}: FilterCheckboxesHeaderProps) => {
  return (
    <div className={styles.wrapper}>
      {children}
      <Link onClick={onClear}>(clear)</Link>
    </div>
  );
};

export { FilterCheckboxesHeader };

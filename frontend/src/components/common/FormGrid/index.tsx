import styles from "./index.module.css";
import { SectionHeader } from "src/components/common/Section";

enum FormGridType {
  Column = "column",
  Row = "row",
  Grid = "grid",
}

interface FormGridProps {
  gridType?: FormGridType | undefined;
  children: React.ReactNode;
}

interface FormGridFieldSetProps {
  title?: React.ReactElement | string | undefined;
  header?: React.ReactElement | string | undefined;
  footer?: React.ReactElement | string | undefined;
  children: React.ReactNode;
}

const FormGrid = ({ gridType, children }: FormGridProps) => {
  gridType ||= FormGridType.Grid;
  const classNames = [styles[gridType]];
  return <div className={classNames.join(" ")}>{children}</div>;
};

const FormGridFieldSet = ({
  title,
  header,
  footer,
  children,
}: FormGridFieldSetProps) => {
  return (
    <div className={styles.fieldset}>
      {title && (
        <div className={styles.fieldsetTitle}>
          <SectionHeader>{title}</SectionHeader>
        </div>
      )}
      {header && <div className={styles.fieldsetHeader}>{header}</div>}
      <div className={styles.fieldsetFields}>{children}</div>
      {footer && <div className={styles.fieldsetHeader}>{footer}</div>}
    </div>
  );
};

export { FormGridType, FormGrid, FormGridFieldSet };

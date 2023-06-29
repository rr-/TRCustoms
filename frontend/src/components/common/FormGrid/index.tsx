import styles from "./index.module.css";
import { useFormikContext } from "formik";
import { intersection } from "lodash";
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

interface FormGridButtonsProps {
  status?:
    | {
        success?: React.ReactElement | undefined;
        error?: React.ReactElement | undefined;
      }
    | undefined;
  extra?: React.ReactNode | undefined;
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

const FormGridButtons = ({ status, extra, children }: FormGridButtonsProps) => {
  const { errors, touched } = useFormikContext();
  const anyFormikErrors =
    intersection(Object.keys(errors), Object.keys(touched)).length > 0;
  return (
    <div className={styles.buttons}>
      {(status?.success || status?.error || anyFormikErrors) && (
        <div className={styles.buttonsStatus}>
          {anyFormikErrors && (
            <div className="FormFieldError">
              Please review the errors above.
            </div>
          )}

          {status?.success && (
            <div className="FormFieldSuccess">{status.success}</div>
          )}
          {status?.error && (
            <div className="FormFieldError">{status.error}</div>
          )}
        </div>
      )}
      {extra && <div className={styles.buttonsExtra}>{extra}</div>}
      <div className={styles.buttonsWrapper}>{children}</div>
    </div>
  );
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

export { FormGridType, FormGrid, FormGridButtons, FormGridFieldSet };

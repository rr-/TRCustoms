import "./index.css";
import { useFormikContext } from "formik";
import { intersection } from "lodash";

enum FormGridType {
  Column = "column",
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
  const classNames = ["FormGrid", gridType];
  return <div className={classNames.join(" ")}>{children}</div>;
};

const FormGridButtons = ({ status, extra, children }: FormGridButtonsProps) => {
  const { errors, touched } = useFormikContext();
  const anyFormikErrors =
    intersection(Object.keys(errors), Object.keys(touched)).length > 0;
  return (
    <div className="FormGridButtons">
      {(status?.success || status?.error || anyFormikErrors) && (
        <div className="FormGridButtons--status">
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
      {extra && <div className="FormGridButtons--extra">{extra}</div>}
      <div className="FormGridButtons--buttons">{children}</div>
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
    <div className="FormGridFieldSet">
      {title && <h2 className="FormGridFieldSet--title">{title}</h2>}
      {header && <div className="FormGridFieldSet--header">{header}</div>}
      <div className="FormGridFieldSet--fields">{children}</div>
      {footer && <div className="FormGridFieldSet--header">{footer}</div>}
    </div>
  );
};

export { FormGridType, FormGrid, FormGridButtons, FormGridFieldSet };

import "./FormGrid.css";
import { useFormikContext } from "formik";
import { intersection } from "lodash";

interface FormGridProps {
  children: React.ReactNode;
}

interface FormGridButtonsProps {
  status?: { success?: React.ReactElement; error?: React.ReactElement };
  children: React.ReactNode;
}

interface FormGridFieldSetProps {
  title?: React.ReactElement | string;
  children: React.ReactNode;
}

const FormGrid = ({ children }: FormGridProps) => {
  return <div className="FormGrid">{children}</div>;
};

const FormGridButtons = ({ status, children }: FormGridButtonsProps) => {
  const { errors, touched } = useFormikContext();
  return (
    <div className="FormGridButtons">
      <div className="FormGridButtons--status">
        {intersection(Object.keys(errors), Object.keys(touched)).length > 0 && (
          <div className="FormFieldError">Please review the errors above.</div>
        )}

        {status?.success && (
          <div className="FormFieldSuccess">{status.success}</div>
        )}
        {status?.error && <div className="FormFieldError">{status.error}</div>}
      </div>
      <div className="FormGridButtons--buttons">{children}</div>
    </div>
  );
};

const FormGridFieldSet = ({ title, children }: FormGridFieldSetProps) => {
  return (
    <div className="FormGridFieldSet">
      {title && <h2 className="FormGridFieldSet--title">{title}</h2>}
      <div className="FormGridFieldSet--fields">{children}</div>
    </div>
  );
};

export { FormGrid, FormGridButtons, FormGridFieldSet };

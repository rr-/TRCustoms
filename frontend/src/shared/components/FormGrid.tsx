import "./FormGrid.css";

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
  return (
    <div className="FormGridButtons">
      <div className="FormGridButtons--status">
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

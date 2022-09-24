import "./index.css";

interface SidebarBoxProps {
  header?: React.ReactNode | undefined;
  actions?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const SidebarBox = ({ header, actions, children }: SidebarBoxProps) => {
  return (
    <div className="SidebarBox ChildMarginClear">
      {header && <div className="SidebarBox--header">{header}</div>}
      {actions && <div className="SidebarBox--actions">{actions}</div>}
      <div className="SidebarBox--body ChildMarginClear">{children}</div>
    </div>
  );
};

export { SidebarBox };

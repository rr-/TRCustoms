import "./SidebarBox.css";

interface SidebarBoxProps {
  id?: string | undefined;
  header?: React.ReactNode | undefined;
  actions?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const SidebarBox = ({ id, header, actions, children }: SidebarBoxProps) => {
  return (
    <div id={id || undefined} className="SidebarBox">
      {header && <div className="SidebarBox--header">{header}</div>}
      {actions && <div className="SidebarBox--actions">{actions}</div>}
      {children}
    </div>
  );
};

export { SidebarBox };

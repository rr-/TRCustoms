import "./SidebarBox.css";

interface SidebarBoxProps {
  id?: string | undefined;
  actions?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const SidebarBox = ({ id, actions, children }: SidebarBoxProps) => {
  return (
    <div id={id || undefined} className="SidebarBox">
      {actions && <div className="SidebarBox--actions">{actions}</div>}
      {children}
    </div>
  );
};

export { SidebarBox };

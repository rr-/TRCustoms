import "./SidebarBox.css";

interface SidebarBoxProps {
  id?: string | null;
  actions?: React.ReactNode | null;
  children: React.ReactNode;
}

const SidebarBox = ({ id, actions, children }: SidebarBoxProps) => {
  return (
    <div id={id} className="SidebarBox">
      {actions && <div className="SidebarBox--actions">{actions}</div>}
      {children}
    </div>
  );
};

export default SidebarBox;

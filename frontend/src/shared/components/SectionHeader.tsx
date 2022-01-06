import "./SectionHeader.css";

interface SectionHeaderProps {
  children: React.ReactNode;
}

const SectionHeader = ({ children }: SectionHeaderProps) => {
  return <h2 className="SectionHeader">{children}</h2>;
};

export { SectionHeader };

import "./SectionHeader.css";

interface SectionHeaderProps {
  className?: string | undefined;
  children: React.ReactNode;
}

const SectionHeader = ({ className, children }: SectionHeaderProps) => {
  return <h2 className={`SectionHeader ${className}`}>{children}</h2>;
};

export { SectionHeader };

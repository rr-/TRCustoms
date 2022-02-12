import "./Section.css";

interface SectionProps {
  className?: string | undefined;
  children: React.ReactNode;
}

interface SectionHeaderProps {
  className?: string | undefined;
  children: React.ReactNode;
}

const Section = ({ className, children }: SectionProps) => {
  return <section className={`Section ${className}`}>{children}</section>;
};

const SectionHeader = ({ className, children }: SectionHeaderProps) => {
  return <h2 className={`SectionHeader ${className}`}>{children}</h2>;
};

export { Section, SectionHeader };

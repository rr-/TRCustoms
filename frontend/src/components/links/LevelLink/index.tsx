import { Link } from "src/components/common/Link";

interface LevelLinkProps {
  className?: string | undefined;
  level: { id: number; name: string };
  children?: React.ReactNode | undefined;
}

const LevelLink = ({ level, children, ...props }: LevelLinkProps) => {
  const { id, name } = level;

  if (id) {
    return (
      <Link to={`/levels/${id}`} {...props}>
        {children || name}
      </Link>
    );
  }

  return <>{children || name}</>;
};

export { LevelLink };

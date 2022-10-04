import { Link } from "src/components/common/Link";
import { LevelNested } from "src/services/LevelService";

interface LevelLinkProps {
  className?: string | undefined;
  level: LevelNested;
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

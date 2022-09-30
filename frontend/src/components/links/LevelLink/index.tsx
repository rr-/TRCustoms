import { Link } from "react-router-dom";
import { SmartWrap } from "src/components/common/SmartWrap";
import { LevelNested } from "src/services/LevelService";

interface LevelLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  level: LevelNested;
  children?: React.ReactNode | undefined;
}

const LevelLink = ({ level, children, ...props }: LevelLinkProps) => {
  const { id, name } = level;

  if (id) {
    return (
      <Link to={`/levels/${id}`} {...props}>
        {children || <SmartWrap text={name} />}
      </Link>
    );
  }

  return <>{children || name}</>;
};

export { LevelLink };

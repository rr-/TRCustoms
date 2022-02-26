import { Link } from "react-router-dom";
import { LevelNested } from "src/services/LevelService";

interface LevelLinkProps {
  level: LevelNested;
  children?: React.ReactNode | undefined;
}

const LevelLink = ({ level, children }: LevelLinkProps) => {
  const { id, name } = level;
  if (id) {
    return <Link to={`/levels/${id}`}>{children || name}</Link>;
  }
  return <>{children || name}</>;
};

export { LevelLink };

import { Link } from "react-router-dom";
import { LevelNested } from "src/services/level.service";

interface LevelLinkProps {
  level: LevelNested;
  label?: string | undefined;
}

const LevelLink = ({ level, label }: LevelLinkProps) => {
  const { id, name } = level;
  label ||= name;
  if (id) {
    return <Link to={`/levels/${id}`}>{label}</Link>;
  }
  return <>label</>;
};

export { LevelLink };

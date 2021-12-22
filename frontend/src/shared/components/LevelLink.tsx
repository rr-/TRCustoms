import { Link } from "react-router-dom";
import type { Level } from "src/services/level.service";

interface LevelLinkProps {
  level: Level;
}

const LevelLink = ({ level }: LevelLinkProps) => {
  const { id, name } = level;
  return <Link to={`/levels/${id}`}>{name}</Link>;
};

export default LevelLink;

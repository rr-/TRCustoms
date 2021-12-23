import { Link } from "react-router-dom";

interface Level {
  id: number;
  name: string;
}

interface LevelLinkProps {
  level: Level;
  label?: string | null;
}

const LevelLink = ({ level, label }: LevelLinkProps) => {
  const { id, name } = level;
  return <Link to={`/levels/${id}`}>{label || name}</Link>;
};

export default LevelLink;

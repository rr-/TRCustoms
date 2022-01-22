import { Link } from "react-router-dom";

interface Level {
  id: number | null;
  name: string;
}

interface LevelLinkProps {
  level: Level;
  label?: string | null;
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

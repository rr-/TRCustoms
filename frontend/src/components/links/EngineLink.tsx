import { Link } from "react-router-dom";
import type { EngineNested } from "src/services/EngineService";

interface EngineLinkProps {
  engine: EngineNested;
  children?: React.ReactNode | undefined;
}

const EngineLink = ({ engine, children }: EngineLinkProps) => {
  const { id, name } = engine;
  return <Link to={`/?engines=${id}`}>{children || name}</Link>;
};

export { EngineLink };

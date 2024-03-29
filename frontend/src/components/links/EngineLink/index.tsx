import { Link } from "src/components/common/Link";
import type { EngineNested } from "src/services/EngineService";

interface EngineLinkProps {
  engine: EngineNested;
  children?: React.ReactNode | undefined;
}

const EngineLink = ({ engine, children, ...props }: EngineLinkProps) => {
  const { id, name } = engine;
  return <Link to={`/levels?engines=${id}`}>{children || name}</Link>;
};

export { EngineLink };
export type { EngineLinkProps };

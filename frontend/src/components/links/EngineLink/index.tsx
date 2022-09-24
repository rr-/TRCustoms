import { Link } from "react-router-dom";
import type { EngineNested } from "src/services/EngineService";

interface EngineLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  engine: EngineNested;
  children?: React.ReactNode | undefined;
}

const EngineLink = ({ engine, children, ...props }: EngineLinkProps) => {
  const { id, name } = engine;
  return (
    <Link to={`/levels?engines=${id}`} {...props}>
      {children || name}
    </Link>
  );
};

export { EngineLink };
export type { EngineLinkProps };

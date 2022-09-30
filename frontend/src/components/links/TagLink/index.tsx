import { Link } from "react-router-dom";
import { SmartWrap } from "src/components/common/SmartWrap";
import type { TagNested } from "src/services/TagService";

interface TagLinkProps {
  tag: TagNested;
  children?: React.ReactNode | undefined;
}

const TagLink = ({ tag, children }: TagLinkProps) => {
  const { id, name } = tag;
  return (
    <Link to={`/levels?tags=${id}`}>
      {children || <SmartWrap text={name} />}
    </Link>
  );
};

export { TagLink };

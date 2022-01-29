import { Link } from "react-router-dom";
import type { TagNested } from "src/services/tag.service";

interface TagLinkProps {
  tag: TagNested;
  label?: string | undefined;
}

const TagLink = ({ tag, label }: TagLinkProps) => {
  const { id, name } = tag;
  label ||= name;
  return <Link to={`/?tags=${id}`}>{label}</Link>;
};

export { TagLink };

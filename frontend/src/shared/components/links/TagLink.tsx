import { Link } from "react-router-dom";
import type { TagLite } from "src/services/tag.service";

interface TagLinkProps {
  tag: TagLite;
  label?: string | null;
}

const TagLink = ({ tag, label }: TagLinkProps) => {
  const { id, name } = tag;
  label ||= name;
  return <Link to={`/?tags=${id}`}>{label}</Link>;
};

export { TagLink };

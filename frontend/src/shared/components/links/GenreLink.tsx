import { Link } from "react-router-dom";
import type { GenreNested } from "src/services/genre.service";

interface GenreLinkProps {
  genre: GenreNested;
  label?: string | null;
}

const GenreLink = ({ genre, label }: GenreLinkProps) => {
  const { id, name } = genre;
  label ||= name;
  return <Link to={`/?genres=${id}`}>{label}</Link>;
};

export { GenreLink };

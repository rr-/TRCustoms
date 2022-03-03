import { Link } from "react-router-dom";
import type { GenreNested } from "src/services/GenreService";

interface GenreLinkProps {
  genre: GenreNested;
  children?: React.ReactNode | undefined;
}

const GenreLink = ({ genre, children }: GenreLinkProps) => {
  const { id, name } = genre;
  return <Link to={`/levels?genres=${id}`}>{children || name}</Link>;
};

export { GenreLink };

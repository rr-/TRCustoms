import { Link } from "react-router-dom";

interface Genre {
  id: number | null;
  name: string;
}

interface GenreLinkProps {
  genre: Genre;
  label?: string | null;
}

const GenreLink = ({ genre, label }: GenreLinkProps) => {
  const { id, name } = genre;
  label ||= name;
  return <Link to={`/?genres=${id}`}>{label}</Link>;
};

export { GenreLink };

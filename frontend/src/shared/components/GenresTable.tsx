import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { IGenre } from "src/services/level.service";
import { IGenreList } from "src/services/level.service";
import { IGenreQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import { IDataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { formatDate } from "src/shared/utils";

const GenresTable = ({ query }: { query: IGenreQuery | null }) => {
  const genresQuery = useQuery<IGenreList, Error>(["genres", query], async () =>
    LevelService.getGenres(query)
  );

  const columns: IDataTableColumn<IGenre>[] = [
    {
      name: "name",
      sortKey: "name",
      label: "Name",
      itemElement: (genre) => (
        <Link to={`/?genres=${genre.id}`}>{genre.name}</Link>
      ),
    },
    {
      name: "level-count",
      sortKey: "level_count",
      label: "Usages",
      itemElement: (genre) => `${genre.level_count}`,
    },
    {
      name: "created",
      sortKey: "created",
      label: "Created",
      itemElement: (genre) => formatDate(genre.created),
    },
    {
      name: "updated",
      sortKey: "last_updated",
      label: "Updated",
      itemElement: (genre) => formatDate(genre.last_updated),
    },
  ];

  const itemKey = (genre) => `${genre.id}`;

  return <DataTable query={genresQuery} columns={columns} itemKey={itemKey} />;
};

export default GenresTable;

import "./GenresTable.css";
import { useQuery } from "react-query";
import type { Genre } from "src/services/level.service";
import type { GenreList } from "src/services/level.service";
import type { GenreQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import GenreLink from "src/shared/components/GenreLink";
import { formatDate } from "src/shared/utils";

interface GenresTableProps {
  query: GenreQuery | null;
  onQueryChange?: (query: GenreQuery) => any | null;
}

const GenresTable = ({ query, onQueryChange }: GenresTableProps) => {
  const result = useQuery<GenreList, Error>(["genres", query], async () =>
    LevelService.getGenres(query)
  );

  const columns: DataTableColumn<Genre>[] = [
    {
      name: "name",
      sortKey: "name",
      label: "Name",
      itemElement: (genre) => <GenreLink genre={genre} />,
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

  return (
    <DataTable
      className="GenresTable"
      result={result}
      columns={columns}
      itemKey={itemKey}
      sort={query.sort}
      onSortChange={(sort) => onQueryChange?.({ ...query, sort: sort })}
      onPageChange={(page) => onQueryChange?.({ ...query, page: page })}
    />
  );
};

export { GenresTable };

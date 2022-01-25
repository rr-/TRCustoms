import "./GenresTable.css";
import type { GenreListing } from "src/services/genre.service";
import type { GenreSearchQuery } from "src/services/genre.service";
import { GenreService } from "src/services/genre.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { GenreLink } from "src/shared/components/links/GenreLink";
import { formatDate } from "src/shared/utils";

interface GenresTableProps {
  searchQuery: GenreSearchQuery;
  onSearchQueryChange?: (searchQuery: GenreSearchQuery) => any | null;
}

const GenresTable = ({
  searchQuery,
  onSearchQueryChange,
}: GenresTableProps) => {
  const columns: DataTableColumn<GenreListing>[] = [
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

  const itemKey = (genre: GenreListing) => `${genre.id}`;

  return (
    <DataTable
      className="GenresTable"
      queryName="genres"
      columns={columns}
      itemKey={itemKey}
      searchQuery={searchQuery}
      searchFunc={GenreService.searchGenres}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { GenresTable };

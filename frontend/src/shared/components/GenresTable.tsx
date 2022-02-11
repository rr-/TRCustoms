import "./GenresTable.css";
import type { GenreListing } from "src/services/genre.service";
import type { GenreSearchQuery } from "src/services/genre.service";
import { GenreService } from "src/services/genre.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { PushButton } from "src/shared/components/PushButton";
import { GenreLink } from "src/shared/components/links/GenreLink";
import { formatDate } from "src/shared/utils";

interface GenresTableProps {
  searchQuery: GenreSearchQuery;
  onSearchQueryChange?: ((searchQuery: GenreSearchQuery) => void) | undefined;
}

const GenresTableDetails = (genre: GenreListing) => {
  return <p>Name: {genre.name}</p>;
};

const GenresTable = ({
  searchQuery,
  onSearchQueryChange,
}: GenresTableProps) => {
  const columns: DataTableColumn<GenreListing>[] = [
    {
      name: "name",
      sortKey: "name",
      label: "Name",
      itemElement: ({ item, toggleActive }) => (
        <PushButton isPlain={true} disableTimeout={true} onClick={toggleActive}>
          {item.name}
        </PushButton>
      ),
    },
    {
      name: "level-count",
      sortKey: "level_count",
      label: "Usages",
      itemElement: ({ item }) => `${item.level_count}`,
    },
    {
      name: "created",
      sortKey: "created",
      label: "Created",
      itemElement: ({ item }) => formatDate(item.created),
    },
    {
      name: "updated",
      sortKey: "last_updated",
      label: "Updated",
      itemElement: ({ item }) => formatDate(item.last_updated),
    },
  ];

  const itemKey = (genre: GenreListing) => `${genre.id}`;

  return (
    <DataTable
      className="GenresTable"
      queryName="genres"
      columns={columns}
      itemKey={itemKey}
      detailsElement={GenresTableDetails}
      searchQuery={searchQuery}
      searchFunc={GenreService.searchGenres}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { GenresTable };

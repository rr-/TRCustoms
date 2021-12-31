import "./GenresTable.css";
import { useQuery } from "react-query";
import type { Genre } from "src/services/genre.service";
import type { GenreSearchResult } from "src/services/genre.service";
import type { GenreSearchQuery } from "src/services/genre.service";
import { GenreService } from "src/services/genre.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import GenreLink from "src/shared/components/GenreLink";
import { formatDate } from "src/shared/utils";

interface GenresTableProps {
  searchQuery: GenreSearchQuery | null;
  onSearchQueryChange?: (searchQuery: GenreSearchQuery) => any | null;
}

const GenresTable = ({
  searchQuery,
  onSearchQueryChange,
}: GenresTableProps) => {
  const result = useQuery<GenreSearchResult, Error>(
    ["genres", searchQuery],
    async () => GenreService.searchGenres(searchQuery)
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
      sort={searchQuery.sort}
      onSortChange={(sort) =>
        onSearchQueryChange?.({ ...searchQuery, sort: sort })
      }
      onPageChange={(page) =>
        onSearchQueryChange?.({ ...searchQuery, page: page })
      }
    />
  );
};

export { GenresTable };

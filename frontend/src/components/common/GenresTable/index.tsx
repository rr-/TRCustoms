import styles from "./index.module.css";
import { useQuery } from "react-query";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { Link } from "src/components/common/Link";
import { Loader } from "src/components/common/Loader";
import { GenreLink } from "src/components/links/GenreLink";
import type { GenreListing } from "src/services/GenreService";
import type { GenreSearchQuery } from "src/services/GenreService";
import { GenreService } from "src/services/GenreService";
import { formatDate } from "src/utils/string";

interface GenresTableProps {
  searchQuery: GenreSearchQuery;
  onSearchQueryChange?: ((searchQuery: GenreSearchQuery) => void) | undefined;
}

interface GenresTableDetailsProps {
  genre: GenreListing;
}

const GenresTableDetails = ({ genre }: GenresTableDetailsProps) => {
  const result = useQuery<GenreListing[], Error>(
    ["genre", GenreService.getStats, genre.id],
    async () => GenreService.getStats(+genre.id)
  );

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  return (
    <>
      <p>
        <GenreLink genre={genre}>{genre.level_count} levels</GenreLink> use this
        genre.
      </p>
      {result.data.length > 0 ? (
        <>
          <p>Used with:</p>
          <ul>
            {result.data.map((genre) => (
              <li key={genre.id}>
                <GenreLink genre={genre} />: {genre.level_count}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Not used with other genres.</p>
      )}
    </>
  );
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
        <Link onClick={toggleActive}>{item.name}</Link>
      ),
    },
    {
      name: "levelCount",
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
      className={styles.table}
      queryName="genres"
      columns={columns}
      itemKey={itemKey}
      detailsElement={(item) => <GenresTableDetails genre={item} />}
      searchQuery={searchQuery}
      searchFunc={GenreService.searchGenres}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { GenresTable };

import { useQuery } from "react-query";
import Pager from "src/components/Pager";
import { IGenreList } from "src/services/level.service";
import { IGenreQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import Loader from "src/shared/components/Loader";
import SortLink from "src/shared/components/SortLink";
import { DISABLE_PAGING } from "src/shared/types";
import { formatDate } from "src/shared/utils";

const GenresTable = ({ query }: { query: IGenreQuery | null }) => {
  const genresQuery = useQuery<IGenreList, Error>(["genres", query], async () =>
    LevelService.getGenres(query)
  );

  if (genresQuery.error) {
    return <p>{genresQuery.error.message}</p>;
  }

  if (genresQuery.isLoading || !genresQuery.data) {
    return <Loader />;
  }

  if (!genresQuery.data.results.length) {
    return <p>There are no genres to show.</p>;
  }

  return (
    <>
      <table className="GenresTable borderless">
        <thead>
          <tr>
            <th className="GenresTable--name">
              <SortLink sort={"name"}>Name</SortLink>
            </th>
            <th className="GenresTable--level-count">
              <SortLink sort={"level_count"}>Usages</SortLink>
            </th>
            <th className="GenresTable--created">
              <SortLink sort={"created"}>Created</SortLink>
            </th>
            <th className="GenresTable--updated">
              <SortLink sort={"last_updated"}>Updated</SortLink>
            </th>
          </tr>
        </thead>
        <tbody>
          {genresQuery.data.results.map((tag) => (
            <tr key={tag.id}>
              <td className="GenresTable--name">{tag.name}</td>
              <td className="GenresTable--level-count">{tag.level_count}</td>
              <td className="GenresTable--created">
                {formatDate(tag.created)}
              </td>
              <td className="GenresTable--updated">
                {formatDate(tag.last_updated)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {query.page !== DISABLE_PAGING && (
        <div id="GenresTable--pager">
          <Pager pagedResponse={genresQuery.data} />
        </div>
      )}
    </>
  );
};

export default GenresTable;

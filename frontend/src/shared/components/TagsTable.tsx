import { useQuery } from "react-query";
import Pager from "src/components/Pager";
import { ITagList } from "src/services/level.service";
import { ITagQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import Loader from "src/shared/components/Loader";
import SortLink from "src/shared/components/SortLink";
import { formatDate } from "src/shared/utils";

const TagsTable = ({ query }: { query: ITagQuery | null }) => {
  const tagsQuery = useQuery<ITagList, Error>(["tags", query], async () =>
    LevelService.getTags(query)
  );

  if (tagsQuery.error) {
    return <p>{tagsQuery.error.message}</p>;
  }

  if (tagsQuery.isLoading || !tagsQuery.data) {
    return <Loader />;
  }

  if (!tagsQuery.data.results.length) {
    return <p>There are no tags to show.</p>;
  }

  return (
    <>
      <table className="TagsTable borderless">
        <thead>
          <tr>
            <th className="TagsTable--name">
              <SortLink sort={"name"}>Name</SortLink>
            </th>
            <th className="TagsTable--level-count">
              <SortLink sort={"level_count"}>Usages</SortLink>
            </th>
            <th className="TagsTable--created">
              <SortLink sort={"created"}>Created</SortLink>
            </th>
            <th className="TagsTable--updated">
              <SortLink sort={"last_updated"}>Updated</SortLink>
            </th>
          </tr>
        </thead>
        <tbody>
          {tagsQuery.data.results.map((tag) => (
            <tr key={tag.id}>
              <td className="TagsTable--name">{tag.name}</td>
              <td className="TagsTable--level-count">{tag.level_count}</td>
              <td className="TagsTable--created">{formatDate(tag.created)}</td>
              <td className="TagsTable--updated">
                {formatDate(tag.last_updated)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div id="TagsTable--pager">
        <Pager pagedResponse={tagsQuery.data} />
      </div>
    </>
  );
};

export default TagsTable;

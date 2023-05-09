import styles from "./index.module.css";
import { useQuery } from "react-query";
import { Button } from "src/components/common/Button";
import { GFXCard } from "src/components/common/GFXCard";
import { Link } from "src/components/common/Link";
import { Loader } from "src/components/common/Loader";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { NewsLink } from "src/components/links/NewsLink";
import type { NewsListing } from "src/services/NewsService";
import { NewsSearchResult } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

const NewsSidebar = () => {
  const searchQuery = {
    pageSize: 10,
  };
  const result = useQuery<NewsSearchResult, Error>(
    ["news", searchQuery],
    async () => NewsService.searchNews(searchQuery)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  return (
    <SidebarBox>
      <SectionHeader>News</SectionHeader>

      <Link to="/news/">
        <GFXCard name="news">Archive</GFXCard>
      </Link>

      {result.data.results.length ? (
        <ul className={styles.list}>
          {result.data.results.map((news: NewsListing) => (
            <li className={styles.listItem} key={news.id}>
              [{formatDate(news.created)}]
              <NewsLink news={news} />
            </li>
          ))}
        </ul>
      ) : (
        <p>There are no results to show.</p>
      )}

      <footer className={styles.footer}>
        <PermissionGuard require={UserPermission.editNews}>
          <Button to="/news/create/">Add new</Button>
        </PermissionGuard>
      </footer>
    </SidebarBox>
  );
};

export { NewsSidebar };

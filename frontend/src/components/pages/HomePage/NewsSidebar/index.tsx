import styles from "./index.module.css";
import { useQuery } from "react-query";
import { Loader } from "src/components/Loader";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { NewsLink } from "src/components/links/NewsLink";
import type { NewsListing } from "src/services/NewsService";
import { NewsSearchResult } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import { UserPermission } from "src/services/UserService";

const NewsSidebar = () => {
  const searchQuery = {};
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

      {result.data.results.length ? (
        <ul className={styles.list}>
          {result.data.results.map((news: NewsListing) => (
            <li className={styles.listItem} key={news.id}>
              <NewsLink news={news} />
            </li>
          ))}
        </ul>
      ) : (
        <p>There are no results to show.</p>
      )}

      <footer className={styles.footer}>
        <PermissionGuard require={UserPermission.editNews}>
          <PushButton to="/news/">Add new</PushButton>
        </PermissionGuard>
      </footer>
    </SidebarBox>
  );
};

export { NewsSidebar };

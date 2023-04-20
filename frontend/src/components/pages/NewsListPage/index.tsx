import styles from "./index.module.css";
import { sortBy } from "lodash";
import { groupBy } from "lodash";
import { useQuery } from "react-query";
import { Box } from "src/components/common/Box";
import { Loader } from "src/components/common/Loader";
import { NewsSidebar } from "src/components/common/NewsSidebar";
import { SectionHeader } from "src/components/common/Section";
import { NewsLink } from "src/components/links/NewsLink";
import { DISABLE_PAGING } from "src/constants";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { NewsSearchQuery } from "src/services/NewsService";
import type { NewsSearchResult } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import { formatDate } from "src/utils/string";

const NewsListPage = () => {
  const newsSearchQuery: NewsSearchQuery = {
    page: DISABLE_PAGING,
    sort: "-created",
    search: null,
  };

  const result = useQuery<NewsSearchResult, Error>(
    ["news", NewsService.searchNews, newsSearchQuery],
    async () => NewsService.searchNews(newsSearchQuery)
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "News archive",
      description: "Read the latest news articles.",
    }),
    []
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const resultsByYear = sortBy(
    Object.entries(
      groupBy(result.data.results, (news) =>
        new Date(news.created).getFullYear()
      )
    ),
    ([year, items]) => -year
  );

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <Box>
          {resultsByYear.map(([year, items]) => (
            <>
              <SectionHeader>{year}</SectionHeader>
              <ul>
                {items.map((news) => (
                  <li className={styles.listItem}>
                    [{formatDate(news.created)}]
                    <NewsLink news={news} />
                  </li>
                ))}
              </ul>
            </>
          ))}
        </Box>
      </div>
      <aside className={styles.rightSidebar}>
        <NewsSidebar />
      </aside>
    </div>
  );
};

export { NewsListPage };

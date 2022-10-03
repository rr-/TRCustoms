import styles from "./index.module.css";
import { groupBy } from "lodash";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { Box } from "src/components/common/Box";
import { Loader } from "src/components/common/Loader";
import { NewsSidebar } from "src/components/common/NewsSidebar";
import { SectionHeader } from "src/components/common/Section";
import { NewsLink } from "src/components/links/NewsLink";
import { DISABLE_PAGING } from "src/constants";
import { TitleContext } from "src/contexts/TitleContext";
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
  const { setTitle } = useContext(TitleContext);

  const result = useQuery<NewsSearchResult, Error>(
    ["news", NewsService.searchNews, newsSearchQuery],
    async () => NewsService.searchNews(newsSearchQuery)
  );

  useEffect(() => {
    setTitle("News archive");
  }, [setTitle]);

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const resultsByYear = Object.entries(
    groupBy(result.data.results, (news) => new Date(news.created).getFullYear())
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

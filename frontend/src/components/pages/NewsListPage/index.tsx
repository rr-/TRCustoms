import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash";
import { groupBy } from "lodash";
import { Box } from "src/components/common/Box";
import { Loader } from "src/components/common/Loader";
import { NewsSidebar } from "src/components/common/NewsSidebar";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { SidebarLayoutVariant } from "src/components/layouts/SidebarLayout";
import { NewsLink } from "src/components/links/NewsLink";
import { DISABLE_PAGING } from "src/constants";
import type { NewsSearchQuery } from "src/services/NewsService";
import type { NewsSearchResult } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import { usePageMetadata } from "src/stores/pageMetadata";
import { formatDate } from "src/utils/string";

const NewsListPage = () => {
  const newsSearchQuery: NewsSearchQuery = {
    page: DISABLE_PAGING,
    sort: "-created",
    search: null,
  };

  const result = useQuery<NewsSearchResult, Error>({
    queryKey: ["news", NewsService.searchNews, newsSearchQuery],
    queryFn: async () => NewsService.searchNews(newsSearchQuery),
  });

  usePageMetadata(
    () => ({
      ready: true,
      title: "News archive",
      description: "Read the latest news articles.",
    }),
    [],
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
        new Date(news.created ?? 0).getFullYear(),
      ),
    ),
    ([year, items]) => -year,
  );

  return (
    <SidebarLayout
      variant={SidebarLayoutVariant.Reverse}
      sidebar={<NewsSidebar />}
    >
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
    </SidebarLayout>
  );
};

export { NewsListPage };

import styles from "./index.module.css";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Box } from "src/components/common/Box";
import { Button } from "src/components/common/Button";
import { Loader } from "src/components/common/Loader";
import { NewsSidebar } from "src/components/common/NewsSidebar";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { SidebarLayoutVariant } from "src/components/layouts/SidebarLayout";
import { Markdown } from "src/components/markdown/Markdown";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { NewsDetails } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface NewsPageParams {
  newsId: string;
}

const NewsPage = () => {
  const { newsId } = useParams() as unknown as NewsPageParams;

  const newsResult = useQuery<NewsDetails, Error>(
    ["news", NewsService.getNewsById, newsId],
    async () => NewsService.getNewsById(+newsId),
  );

  usePageMetadata(
    () => ({
      ready: !newsResult.isLoading,
      title: newsResult?.data?.subject,
      description: "Read the latest news articles.",
    }),
    [newsResult],
  );

  if (newsResult.error) {
    return <p>{newsResult.error.message}</p>;
  }

  if (newsResult.isLoading || !newsResult.data) {
    return <Loader />;
  }

  const news: NewsDetails = newsResult.data;

  const content = (
    <Box>
      {news.subject && (
        <SectionHeader>
          <Markdown>{news.subject}</Markdown>
        </SectionHeader>
      )}

      <div className={`${styles.mainText} ChildMarginClear`}>
        <Markdown>{news.text || "No news text is available."}</Markdown>
      </div>

      <footer className={styles.footer}>
        <em>Posted on {formatDate(news.created)}</em>
        <PermissionGuard require={UserPermission.editNews}>
          <Button to={`/news/${newsId}/edit`}>Edit news</Button>
        </PermissionGuard>
      </footer>
    </Box>
  );

  return (
    <SidebarLayout
      variant={SidebarLayoutVariant.Reverse}
      sidebar={<NewsSidebar />}
    >
      <Box>{content}</Box>
    </SidebarLayout>
  );
};

export { NewsPage };

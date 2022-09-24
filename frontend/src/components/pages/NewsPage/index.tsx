import styles from "./index.module.css";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Box } from "src/components/common/Box";
import { Button } from "src/components/common/Button";
import { Loader } from "src/components/common/Loader";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { SectionHeader } from "src/components/common/Section";
import { Markdown } from "src/components/markdown/Markdown";
import { TitleContext } from "src/contexts/TitleContext";
import type { NewsDetails } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface NewsPageParams {
  newsId: string;
}

const NewsPage = () => {
  const { newsId } = (useParams() as unknown) as NewsPageParams;
  const { setTitle } = useContext(TitleContext);

  const newsResult = useQuery<NewsDetails, Error>(
    ["news", NewsService.getNewsById, newsId],
    async () => NewsService.getNewsById(+newsId)
  );

  useEffect(() => {
    setTitle(newsResult?.data?.subject || "");
  }, [setTitle, newsResult]);

  if (newsResult.error) {
    return <p>{newsResult.error.message}</p>;
  }

  if (newsResult.isLoading || !newsResult.data) {
    return <Loader />;
  }

  const news: NewsDetails = newsResult.data;

  return (
    <Box>
      {news.subject && (
        <SectionHeader>
          <Markdown>{news.subject}</Markdown>
        </SectionHeader>
      )}

      <div className={styles.header}>
        <span className={styles.date}>
          Posted on {formatDate(news.created)} by{" "}
        </span>
      </div>

      <div className={styles.content}>
        <Markdown>{news.text || "No news text is available."}</Markdown>
      </div>

      <PermissionGuard require={UserPermission.editNews}>
        <footer className={styles.footer}>
          <Button to={`/news/${newsId}/edit`}>Edit news</Button>
        </footer>
      </PermissionGuard>
    </Box>
  );
};

export { NewsPage };

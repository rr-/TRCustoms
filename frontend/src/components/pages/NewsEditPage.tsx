import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/Loader";
import { NewsForm } from "src/components/NewsForm";
import { PageGuard } from "src/components/PermissionGuard";
import { TitleContext } from "src/contexts/TitleContext";
import type { NewsDetails } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import { UserPermission } from "src/services/UserService";

interface NewsEditPageParams {
  newsId: string;
}

interface NewsEditPageViewProps {
  newsId: string;
}

const NewsEditPageView = ({ newsId }: NewsEditPageViewProps) => {
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);

  const result = useQuery<NewsDetails, Error>(
    ["news", NewsService.getNewsById, newsId],
    async () => NewsService.getNewsById(+newsId)
  );

  const handleGoBack = useCallback(() => navigate("/"), [navigate]);

  useEffect(() => setTitle("News"), [setTitle]);

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const news = result.data;

  return (
    <div id="NewsEditPage">
      <h1>Editing {news.subject || "news"}</h1>
      <NewsForm onGoBack={handleGoBack} news={news} />
    </div>
  );
};

const NewsEditPage = () => {
  const { newsId } = (useParams() as unknown) as NewsEditPageParams;
  return (
    <PageGuard require={UserPermission.editNews}>
      <NewsEditPageView newsId={newsId} />
    </PageGuard>
  );
};

export { NewsEditPage };

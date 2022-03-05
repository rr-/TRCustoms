import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/Loader";
import { NewsForm } from "src/components/NewsForm";
import { TitleContext } from "src/contexts/TitleContext";
import type { NewsDetails } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";

interface NewsEditPageParams {
  newsId: string;
}

const NewsEditPage = () => {
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);
  const { newsId } = (useParams() as unknown) as NewsEditPageParams;

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

export { NewsEditPage };

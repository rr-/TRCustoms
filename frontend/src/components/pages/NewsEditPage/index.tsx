import { useCallback } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { NewsForm } from "src/components/common/NewsForm";
import { PageGuard } from "src/components/common/PermissionGuard";
import { SmartWrap } from "src/components/common/SmartWrap";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
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

  const result = useQuery<NewsDetails, Error>(
    ["news", NewsService.getNewsById, newsId],
    async () => NewsService.getNewsById(+newsId)
  );

  const handleGoBack = useCallback(
    () => navigate(result?.data?.id ? `/news/${result?.data?.id}` : "/"),
    [navigate, result]
  );

  usePageMetadata(() => ({ ready: true, title: "News" }), []);

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const news = result.data;

  return (
    <PlainLayout
      header={<SmartWrap text={`Editing ${news.subject || "news"}`} />}
    >
      <NewsForm onGoBack={handleGoBack} news={news} />
    </PlainLayout>
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

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { SmartWrap } from "src/components/common/SmartWrap";
import { NewsForm } from "src/components/forms/NewsForm";
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

  const result = useQuery<NewsDetails, Error>({
    queryKey: ["news", NewsService.getNewsById, newsId],
    queryFn: async () => NewsService.getNewsById(+newsId),
  });

  const handleGoBack = useCallback(
    () => navigate(result?.data?.id ? `/news/${result?.data?.id}` : "/"),
    [navigate, result],
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
  const { newsId } = useParams() as unknown as NewsEditPageParams;
  return (
    <PageGuard require={UserPermission.editNews}>
      <NewsEditPageView newsId={newsId} />
    </PageGuard>
  );
};

export { NewsEditPage };

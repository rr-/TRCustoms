import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NewsForm } from "src/components/common/NewsForm";
import { PageGuard } from "src/components/common/PermissionGuard";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserPermission } from "src/services/UserService";

const NewsCreatePageView = () => {
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate(`/`);
  }, [navigate]);

  usePageMetadata(() => ({ ready: true, title: "News" }), []);

  return (
    <div className="NewsCreatePage">
      <h1>Creating news</h1>
      <NewsForm onGoBack={handleGoBack} news={null} />
    </div>
  );
};

const NewsCreatePage = () => {
  return (
    <PageGuard require={UserPermission.editNews}>
      <NewsCreatePageView />
    </PageGuard>
  );
};

export { NewsCreatePage };

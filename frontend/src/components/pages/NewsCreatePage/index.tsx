import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NewsForm } from "src/components/common/NewsForm";
import { PageGuard } from "src/components/common/PermissionGuard";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserPermission } from "src/services/UserService";

const NewsCreatePageView = () => {
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate(`/`);
  }, [navigate]);

  usePageMetadata(() => ({ ready: true, title: "News" }), []);

  return <NewsForm onGoBack={handleGoBack} news={null} />;
};

const NewsCreatePage = () => {
  return (
    <PageGuard require={UserPermission.editNews}>
      <PlainLayout header="Creating news">
        <NewsCreatePageView />
      </PlainLayout>
    </PageGuard>
  );
};

export { NewsCreatePage };

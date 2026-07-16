import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageGuard } from "src/components/common/PermissionGuard";
import { NewsForm } from "src/components/forms/NewsForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { UserPermission } from "src/services/UserService";
import { usePageMetadata } from "src/stores/pageMetadata";

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

import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NewsForm } from "src/components/NewsForm";
import { PageGuard } from "src/components/PermissionGuard";
import { TitleContext } from "src/contexts/TitleContext";
import { UserPermission } from "src/services/UserService";

const NewsCreatePageView = () => {
  const { setTitle } = useContext(TitleContext);
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate(`/`);
  }, [navigate]);

  useEffect(() => setTitle("News"), [setTitle]);

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

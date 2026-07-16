import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { SmartWrap } from "src/components/common/SmartWrap";
import { LevelForm } from "src/components/forms/LevelForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { getLevelOwningUserIds } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";
import { usePageMetadata } from "src/stores/pageMetadata";

const LevelEditPage = () => {
  const { levelId = "" } = useParams();
  const navigate = useNavigate();

  const result = useQuery<LevelDetails, Error>({
    queryKey: ["level", LevelService.getLevelById, levelId],
    queryFn: async () => LevelService.getLevelById(+levelId),
  });

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${levelId}`);
  }, [navigate, levelId]);

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result?.data?.name,
    }),
    [result],
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const level = result.data;
  const owningUserIds = getLevelOwningUserIds(level);

  return (
    <PageGuard
      require={UserPermission.editLevels}
      owningUserIds={owningUserIds}
    >
      <PlainLayout header={<SmartWrap text={`Editing ${level.name}`} />}>
        <LevelForm onGoBack={handleGoBack} level={level} />
      </PlainLayout>
    </PageGuard>
  );
};

export { LevelEditPage };

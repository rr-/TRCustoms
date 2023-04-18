import { useCallback } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { LevelForm } from "src/components/common/LevelForm";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { SmartWrap } from "src/components/common/SmartWrap";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { getLevelOwningUserIds } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";

interface LevelEditPageParams {
  levelId: string;
}

const LevelEditPage = () => {
  const { levelId } = (useParams() as unknown) as LevelEditPageParams;
  const navigate = useNavigate();

  const result = useQuery<LevelDetails, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${levelId}`);
  }, [navigate, levelId]);

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result?.data?.name,
    }),
    [result]
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
      <div className="LevelEditPage">
        <h1>
          <SmartWrap text={`Editing ${level.name}`} />
        </h1>

        <LevelForm onGoBack={handleGoBack} level={level} />
      </div>
    </PageGuard>
  );
};

export { LevelEditPage };

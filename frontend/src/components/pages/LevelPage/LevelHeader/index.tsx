import { useNavigate } from "react-router-dom";
import { LevelApproveButton } from "src/components/buttons/LevelApproveButton";
import { LevelDeleteButton } from "src/components/buttons/LevelDeleteButton";
import { LevelRejectButton } from "src/components/buttons/LevelRejectButton";
import { Button } from "src/components/common/Button";
import { HeaderWithButtons } from "src/components/common/HeaderWithButtons";
import { PageHeader } from "src/components/common/PageHeader";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { SmartWrap } from "src/components/common/SmartWrap";
import { IconPencil } from "src/components/icons";
import type { LevelDetails } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";

interface LevelHeaderProps {
  level: LevelDetails;
}

const LevelHeader = ({ level }: LevelHeaderProps) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    navigate("/");
  };

  const header = <PageHeader header={<SmartWrap text={level.name} />} />;

  const buttons = (
    <>
      <PermissionGuard
        require={UserPermission.editLevels}
        owningUsers={[
          ...level.authors,
          ...(level.uploader ? [level.uploader] : []),
        ]}
      >
        <Button icon={<IconPencil />} to={`/levels/${level.id}/edit`}>
          Edit
        </Button>
      </PermissionGuard>

      <PermissionGuard require={UserPermission.editLevels}>
        <LevelRejectButton level={level} />
        {!level.is_approved && <LevelApproveButton level={level} />}
      </PermissionGuard>

      <PermissionGuard require={UserPermission.deleteLevels}>
        <LevelDeleteButton level={level} onComplete={handleDelete} />
      </PermissionGuard>
    </>
  );

  return <HeaderWithButtons header={header} buttons={buttons} />;
};

export { LevelHeader };

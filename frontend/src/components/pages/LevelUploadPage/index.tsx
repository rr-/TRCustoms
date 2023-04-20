import { useState } from "react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { LevelForm } from "src/components/common/LevelForm";
import { PageGuard } from "src/components/common/PermissionGuard";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { LevelDetails } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";

const LevelUploadPageView = () => {
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = useCallback(
    async (level: LevelDetails) => {
      setIsComplete(true);
    },
    [setIsComplete]
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Upload a level",
      description: "Upload your custom Tomb Raider game on our website!",
    }),
    []
  );

  return (
    <div className="LevelUploadForm">
      <h1>Upload new level</h1>

      {isComplete ? (
        <>
          Your level was uploaded and it now needs to be approved by the staff.
          Please have patience :) In the meantime, why don't you take a look at{" "}
          <Link to={"/"}>some levels</Link>?
        </>
      ) : (
        <LevelForm onSubmit={handleSubmit} />
      )}
    </div>
  );
};

const LevelUploadPage = () => {
  return (
    <PageGuard require={UserPermission.uploadLevels}>
      <LevelUploadPageView />
    </PageGuard>
  );
};

export { LevelUploadPage };

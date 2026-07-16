import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { SmartWrap } from "src/components/common/SmartWrap";
import { WalkthroughForm } from "src/components/forms/WalkthroughForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { LevelLink } from "src/components/links/LevelLink";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";

interface WalkthroughEditPageParams {
  levelId: string;
  walkthroughId: string;
}

const WalkthroughEditPage = () => {
  const { levelId, walkthroughId } =
    useParams() as unknown as WalkthroughEditPageParams;

  // React Query v5 forbids a query function from resolving to undefined, so
  // these return null when the id is absent (creating a walkthrough has no
  // walkthroughId; editing via the /walkthroughs route has no levelId).
  const levelResult = useQuery<LevelDetails | null, Error>({
    queryKey: ["level", LevelService.getLevelById, levelId],
    queryFn: async () => (levelId ? LevelService.getLevelById(+levelId) : null),
  });

  const walkthroughResult = useQuery<WalkthroughDetails | null, Error>({
    queryKey: [
      "walkthrough",
      WalkthroughService.getWalkthroughById,
      walkthroughId,
    ],
    queryFn: async () =>
      walkthroughId
        ? WalkthroughService.getWalkthroughById(+walkthroughId)
        : null,
  });

  usePageMetadata(
    () => ({
      ready: !levelResult.isLoading && !walkthroughResult.isLoading,
      title: levelResult?.data?.name
        ? `Walkthrough for ${levelResult.data.name}`
        : "Walkthrough",
    }),
    [walkthroughResult, levelResult],
  );

  if (levelResult.error) {
    return <p>{levelResult.error.message}</p>;
  }
  if (walkthroughResult.error) {
    return <p>{walkthroughResult.error.message}</p>;
  }

  if (levelResult.isLoading || walkthroughResult.isLoading) {
    return <Loader />;
  }

  const level = levelResult.data;
  const walkthrough = walkthroughResult?.data;

  if (!level && !walkthrough) {
    return <p>Invalid action.</p>;
  }

  const actualLevel = level || walkthrough?.level;
  const header = actualLevel ? (
    <>
      Walkthrough for{" "}
      <LevelLink level={actualLevel}>
        <SmartWrap text={actualLevel.name} />
      </LevelLink>
    </>
  ) : (
    <>Walkthrough</>
  );

  return (
    <PageGuard
      require={
        walkthrough
          ? UserPermission.editWalkthroughs
          : UserPermission.postWalkthroughs
      }
      owningUserIds={walkthrough?.author ? [walkthrough.author.id] : []}
    >
      <PlainLayout header={header}>
        <div className={styles.wrapper}>
          <WalkthroughForm
            walkthrough={walkthrough || undefined}
            level={level || walkthrough?.level}
          />
        </div>
      </PlainLayout>
    </PageGuard>
  );
};

export { WalkthroughEditPage };

import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { Loader } from "src/components/common/Loader";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { WalkthroughSidebar } from "src/components/common/WalkthroughSidebar";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { SidebarLayoutVariant } from "src/components/layouts/SidebarLayout";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import { Markdown } from "src/components/markdown/Markdown";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserPermission } from "src/services/UserService";
import { WalkthroughType } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";

interface WalkthroughStatusBoxProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughStatusBox = ({ walkthrough }: WalkthroughStatusBoxProps) => {
  switch (walkthrough.status) {
    case WalkthroughStatus.Draft:
      return (
        <InfoMessage type={InfoMessageType.Info}>
          This walkthrough is a draft.
          <PermissionGuard
            require={UserPermission.editWalkthroughs}
            owningUsers={walkthrough.author ? [walkthrough.author] : []}
          >
            <br />
            To mark it as ready for approval, please click the "Submit for
            approval" button.
          </PermissionGuard>
        </InfoMessage>
      );
    case WalkthroughStatus.PendingApproval:
      return (
        <InfoMessage type={InfoMessageType.Info}>
          This walkthrough is currently pending approval.
        </InfoMessage>
      );
    case WalkthroughStatus.Rejected:
      return (
        <InfoMessage type={InfoMessageType.Warning}>
          This walkthrough was rejected by staff.
          {walkthrough.rejection_reason && (
            <>
              <br />
              Reason: {walkthrough.rejection_reason}
            </>
          )}
        </InfoMessage>
      );
  }

  return null;
};

interface WalkthroughPageParams {
  walkthroughId: string;
}

const WalkthroughPage = () => {
  const { walkthroughId } = (useParams() as unknown) as WalkthroughPageParams;

  const result = useQuery<WalkthroughDetails | null, Error>(
    ["walkthrough", WalkthroughService.getWalkthroughById, walkthroughId],
    async () => WalkthroughService.getWalkthroughById(+walkthroughId)
  );

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result.data?.level.name
        ? `Walkthrough for ${result.data.level.name}`
        : "Walkthrough",
      description: result.data?.author?.username
        ? `A walkthrough by ${result.data.author.username}`
        : result.data?.level.name
        ? `A walkthrough for ${result.data.level.name}`
        : null,
      image: result.data?.level.cover?.url,
    }),
    [result]
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const walkthrough = result.data;
  const header = (
    <>
      Walkthrough for <LevelLink level={walkthrough.level} />
    </>
  );
  const subheader = walkthrough.author ? (
    <>
      by <UserLink user={walkthrough.author} />
    </>
  ) : (
    walkthrough.legacy_author_name && <>by {walkthrough.legacy_author_name}</>
  );
  const sidebar = <WalkthroughSidebar walkthrough={walkthrough} />;
  const content = (
    <>
      <WalkthroughStatusBox walkthrough={walkthrough} />
      <Markdown>{walkthrough.text}</Markdown>
    </>
  );

  return (
    <SidebarLayout
      variant={
        walkthrough.walkthrough_type === WalkthroughType.Link
          ? SidebarLayoutVariant.Stacked
          : SidebarLayoutVariant.Regular
      }
      header={header}
      subheader={subheader}
      sidebar={sidebar}
    >
      {content}
    </SidebarLayout>
  );
};

export { WalkthroughPage };

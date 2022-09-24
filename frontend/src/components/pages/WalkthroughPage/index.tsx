import "./index.css";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { InfoMessage } from "src/components/InfoMessage";
import { InfoMessageType } from "src/components/InfoMessage";
import { Loader } from "src/components/Loader";
import { PermissionGuard } from "src/components/PermissionGuard";
import { WalkthroughSidebar } from "src/components/WalkthroughSidebar";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import { Markdown } from "src/components/markdown/Markdown";
import { TitleContext } from "src/contexts/TitleContext";
import { UserPermission } from "src/services/UserService";
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
  const { setTitle } = useContext(TitleContext);
  const { walkthroughId } = (useParams() as unknown) as WalkthroughPageParams;

  const result = useQuery<WalkthroughDetails | null, Error>(
    ["walkthrough", WalkthroughService.getWalkthroughById, walkthroughId],
    async () => WalkthroughService.getWalkthroughById(+walkthroughId)
  );

  useEffect(() => {
    setTitle(
      result?.data?.level.name
        ? `Walkthrough for ${result.data.level.name}`
        : "Walkthrough"
    );
  }, [setTitle, result]);

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const walkthrough = result.data;

  return (
    <div
      className="WalkthroughPage"
      data-walkthrough-type={walkthrough.walkthrough_type}
    >
      <header className="WalkthroughPage--header ChildMarginClear">
        <h1>
          Walkthrough for{" "}
          <LevelLink level={walkthrough.level}>
            {walkthrough.level.name}
          </LevelLink>
        </h1>
        {walkthrough.author ? (
          <h2>
            by <UserLink user={walkthrough.author} />
          </h2>
        ) : (
          walkthrough.legacy_author_name && (
            <h2>by {walkthrough.legacy_author_name}</h2>
          )
        )}
      </header>

      <aside className="WalkthroughPage--sidebar">
        <WalkthroughSidebar walkthrough={walkthrough} />
      </aside>

      <div className="WalkthroughPage--main">
        <WalkthroughStatusBox walkthrough={walkthrough} />

        <Markdown>{walkthrough.text}</Markdown>
      </div>
    </div>
  );
};

export { WalkthroughPage };

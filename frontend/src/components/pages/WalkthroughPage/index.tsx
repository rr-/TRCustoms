import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { SidebarBox } from "src/components/common/SidebarBox";
import { WalkthroughContent } from "src/components/common/WalkthroughContent";
import { WalkthroughStatusBox } from "src/components/common/WalkthroughStatusBox";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { SidebarLayoutVariant } from "src/components/layouts/SidebarLayout";
import { MarkdownTOC } from "src/components/markdown/MarkdownTOC";
import { ResponseErrorPage } from "src/components/pages/ErrorPage";
import { WalkthroughHeader } from "src/components/pages/WalkthroughPage/WalkthroughHeader";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { WalkthroughType } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";

interface WalkthroughPageParams {
  walkthroughId: string;
}

const WalkthroughPage = () => {
  const { walkthroughId } = useParams() as unknown as WalkthroughPageParams;

  const result = useQuery<WalkthroughDetails | null, Error>(
    ["walkthrough", WalkthroughService.getWalkthroughById, walkthroughId],
    async () => WalkthroughService.getWalkthroughById(+walkthroughId),
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
    [result],
  );

  if (result.error) {
    return <ResponseErrorPage error={result.error} />;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const walkthrough = result.data;

  const header = <WalkthroughHeader walkthrough={walkthrough} />;
  const sidebar =
    walkthrough.walkthrough_type === WalkthroughType.Text ? (
      <SidebarBox>
        <MarkdownTOC>{walkthrough.text}</MarkdownTOC>
      </SidebarBox>
    ) : null;

  const content = (
    <>
      <WalkthroughStatusBox walkthrough={walkthrough} showSubmitCta={true} />
      <WalkthroughContent walkthrough={walkthrough} showExcerpts={false} />
    </>
  );

  return (
    <SidebarLayout
      variant={
        walkthrough.walkthrough_type === WalkthroughType.Link
          ? SidebarLayoutVariant.Stacked
          : SidebarLayoutVariant.Reverse
      }
      header={header}
      sidebar={sidebar}
    >
      {content}
    </SidebarLayout>
  );
};

export { WalkthroughPage };

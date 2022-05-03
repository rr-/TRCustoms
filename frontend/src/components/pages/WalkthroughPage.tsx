import "./WalkthroughPage.css";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/Loader";
import { WalkthroughSidebar } from "src/components/WalkthroughSidebar";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import { Markdown } from "src/components/markdown/Markdown";
import { TitleContext } from "src/contexts/TitleContext";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";

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
    <div className="WalkthroughPage">
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
        <Markdown>{walkthrough.text}</Markdown>
      </div>
    </div>
  );
};

export { WalkthroughPage };

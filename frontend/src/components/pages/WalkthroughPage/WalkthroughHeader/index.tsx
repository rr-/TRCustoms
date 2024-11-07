import { HeaderWithButtons } from "src/components/common/HeaderWithButtons";
import { PageHeader } from "src/components/common/PageHeader";
import { SmartWrap } from "src/components/common/SmartWrap";
import { WalkthroughActions } from "src/components/common/WalkthroughActions";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import type { WalkthroughDetails } from "src/services/WalkthroughService";

interface WalkthroughHeaderProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughHeader = ({ walkthrough }: WalkthroughHeaderProps) => {
  const header = (
    <>
      Walkthrough for{" "}
      <LevelLink level={walkthrough.level} subPage="walkthroughs">
        <SmartWrap text={walkthrough.level.name} />
      </LevelLink>
    </>
  );
  const subheader = walkthrough.author ? (
    <>
      by{" "}
      <UserLink user={walkthrough.author}>
        <SmartWrap text={walkthrough.author.username} />
      </UserLink>
    </>
  ) : (
    walkthrough.legacy_author_name && <>by {walkthrough.legacy_author_name}</>
  );

  return (
    <HeaderWithButtons
      header={<PageHeader header={header} subheader={subheader} />}
      buttons={<WalkthroughActions walkthrough={walkthrough} />}
    />
  );
};

export { WalkthroughHeader };

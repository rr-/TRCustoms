import styles from "./index.module.css";
import { BurgerMenu } from "src/components/common/BurgerMenu";
import { UserPicture } from "src/components/common/UserPicture";
import { WalkthroughActions } from "src/components/common/WalkthroughActions";
import { WalkthroughContent } from "src/components/common/WalkthroughContent";
import { WalkthroughStatusBox } from "src/components/common/WalkthroughStatusBox";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import type { WalkthroughListing } from "src/services/WalkthroughService";
import { formatDate } from "src/utils/string";

interface WalkthroughListItemProps {
  walkthrough: WalkthroughListing;
  showLevels: boolean;
}

const WalkthroughListItem = ({
  walkthrough,
  showLevels,
}: WalkthroughListItemProps) => {
  const header = (
    <header className={styles.header}>
      <div className={styles.info}>
        {walkthrough.author && (
          <>
            <UserLink className={styles.userLink} user={walkthrough.author}>
              <>
                <div className={styles.userPic}>
                  <UserPicture user={walkthrough.author} />
                </div>
                {walkthrough.author.username}
              </>
            </UserLink>
          </>
        )}
      </div>

      {walkthrough.last_user_content_updated ? (
        <small>
          Updated on: {formatDate(walkthrough.last_user_content_updated)}
        </small>
      ) : null}

      <small>Posted on: {formatDate(walkthrough.created)}</small>

      <BurgerMenu>
        <WalkthroughActions walkthrough={walkthrough} />
      </BurgerMenu>
    </header>
  );

  return (
    <div className={styles.wrapper}>
      {header}
      <div className={styles.content}>
        <WalkthroughStatusBox walkthrough={walkthrough} showSubmitCta={false} />
        {showLevels ? (
          <p>
            Walkthrough on <LevelLink level={walkthrough.level} />
          </p>
        ) : null}
        <WalkthroughContent walkthrough={walkthrough} showExcerpts={true} />
      </div>
    </div>
  );
};

export { WalkthroughListItem };

import styles from "./index.module.css";
import React from "react";
import { Link } from "src/components/common/Link";
import { YoutubeEmbed } from "src/components/common/YoutubeEmbed";
import { WalkthroughLink } from "src/components/links/WalkthroughLink";
import { Markdown } from "src/components/markdown/Markdown";
import type { WalkthroughListing } from "src/services/WalkthroughService";
import { WalkthroughType } from "src/services/WalkthroughService";
import { parseYoutubeLink } from "src/utils/misc";

interface WalkthroughContentProps {
  walkthrough: WalkthroughListing;
  showExcerpts: boolean;
}

const WalkthroughContent: React.FC<WalkthroughContentProps> = ({
  walkthrough,
  showExcerpts,
}) => {
  const youtubeVideo =
    walkthrough.walkthrough_type === WalkthroughType.Link
      ? parseYoutubeLink(walkthrough.text)
      : null;

  let content: React.ReactNode;
  if (youtubeVideo) {
    content = (
      <div className={`${styles.embedWrapper} ChildMarginClear`}>
        <YoutubeEmbed {...youtubeVideo} showLink={!showExcerpts} />
        {showExcerpts && (
          <>
            <WalkthroughLink
              walkthrough={{
                ...walkthrough,
                levelName: walkthrough.level.name,
              }}
            >
              Watch maximized
            </WalkthroughLink>
            {youtubeVideo.playlistID ? (
              <>
                {" or "}
                <Link to={youtubeVideo.fullUrl}>View the full playlist</Link>
              </>
            ) : null}
          </>
        )}
      </div>
    );
  } else if (!walkthrough.text) {
    content = <>No walkthrough text is available.</>;
  } else if (showExcerpts) {
    content = (
      <>
        <div className={styles.clamped}>
          <Markdown allowSpoilers={false}>{walkthrough.text}</Markdown>
        </div>
        <WalkthroughLink
          walkthrough={{
            ...walkthrough,
            levelName: walkthrough.level.name,
          }}
        >
          Read more
        </WalkthroughLink>
      </>
    );
  } else {
    content = <Markdown allowSpoilers={false}>{walkthrough.text}</Markdown>;
  }

  return content;
};

export { WalkthroughContent };

import styles from "./index.module.css";
import { Link } from "src/components/common/Link";
import type { YoutubeLink } from "src/utils/misc";

interface YoutubeEmbedProps extends YoutubeLink {}

const YoutubeEmbed = ({ fullUrl, playlistID, videoID }: YoutubeEmbedProps) => {
  const link = (
    <>
      <Link to={fullUrl}>Click here</Link> to see the full video/playlist.
    </>
  );

  if (!videoID) {
    return (
      <p>
        No video preview is available.
        <br />
        {link}
      </p>
    );
  }

  let url = `https://www.youtube.com/embed/${videoID}?autoplay=0&iv_load_policy=3&showinfo=0&rel=0&start=0&end=0`;
  if (playlistID) {
    url += `&list=${playlistID}`;
  }

  return (
    <>
      <iframe title="YouTube video" className={styles.embed} src={url} />
      {playlistID && link}
    </>
  );
};

export { YoutubeEmbed };

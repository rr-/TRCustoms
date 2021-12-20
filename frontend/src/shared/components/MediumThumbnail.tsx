import "./MediumThumbnail.css";
import { useCallback, useState } from "react";
import { IMedium } from "src/services/level.service";
import { IMediumList } from "src/services/level.service";

interface IMediumProps {
  medium: IMedium;
}

const MediumThumbnail: React.FunctionComponent<IMediumProps> = ({ medium }) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  const imageClick = useCallback(() => {
    setIsActive(!isActive);
  }, [isActive, setIsActive]);

  return (
    <>
      <img
        alt="Thumbnail"
        className="MediumThumbnail--thumb"
        tabIndex={1}
        src={medium.url}
        onClick={imageClick}
      />
      <span
        className={`MediumThumbnail--full ${isActive ? "active" : null}`}
        onClick={imageClick}
      >
        <img alt="Full resolution" src={medium.url} />
      </span>
    </>
  );
};

interface IMediumThumbnailsProps {
  media: IMediumList;
}

const MediumThumbnails: React.FunctionComponent<IMediumThumbnailsProps> = ({
  media,
}) => {
  return (
    <div className="MediumThumbnails">
      {media.map((medium) => (
        <MediumThumbnail key={medium.id} medium={medium} />
      ))}
    </div>
  );
};

export { MediumThumbnail, MediumThumbnails };

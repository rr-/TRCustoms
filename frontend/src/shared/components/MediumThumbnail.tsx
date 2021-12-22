import "./MediumThumbnail.css";
import { useCallback } from "react";
import { useState } from "react";
import type { Medium } from "src/services/level.service";

interface MediumProps {
  medium: Medium;
}

const MediumThumbnail = ({ medium }: MediumProps) => {
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

export { MediumThumbnail };

import "./MediumThumbnail.css";
import { useCallback } from "react";
import { useState } from "react";
import type { UploadedFile } from "src/services/file.service";

interface MediumProps {
  file: UploadedFile;
}

const MediumThumbnail = ({ file }: MediumProps) => {
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
        src={file.url}
        onClick={imageClick}
      />
      <span
        className={`MediumThumbnail--full ${isActive ? "active" : null}`}
        onClick={imageClick}
      >
        <img alt="Full resolution" src={file.url} />
      </span>
    </>
  );
};

export { MediumThumbnail };

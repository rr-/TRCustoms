import "./MediumThumbnail.css";
import { ChevronLeftIcon } from "@heroicons/react/outline";
import { ChevronRightIcon } from "@heroicons/react/outline";
import uniqueId from "lodash/uniqueId";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import type { UploadedFile } from "src/services/file.service";
import PushButton from "src/shared/components/PushButton";
import { KEY_ESCAPE } from "src/shared/constants";
import { KEY_LEFT } from "src/shared/constants";
import { KEY_RIGHT } from "src/shared/constants";

interface MediumProps {
  file: UploadedFile;
}

const MediumThumbnail = ({ file }: MediumProps) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [elementId] = useState(uniqueId("mediumThumbnail-"));

  const imageClick = useCallback(() => {
    setIsActive(!isActive);
  }, [isActive, setIsActive]);

  const navigate = useCallback(
    (direction) => {
      setIsActive(false);
      const allThumbnails = [
        ...document.getElementsByClassName("MediumThumbnail--full"),
      ] as HTMLElement[];
      let chosenElement: HTMLElement = null;
      for (const [i, element] of allThumbnails.entries()) {
        if (element.getAttribute("id") === elementId) {
          chosenElement = allThumbnails[i + direction];
          break;
        }
      }
      if (chosenElement) {
        chosenElement.click();
      }
    },
    [elementId]
  );

  useEffect(() => {
    const handleKeypress = (event) => {
      if (isActive) {
        if (event.keyCode === KEY_ESCAPE) {
          setIsActive(false);
        } else if (event.keyCode === KEY_LEFT) {
          navigate(-1);
        } else if (event.keyCode === KEY_RIGHT) {
          navigate(+1);
        }
      }
    };

    window.addEventListener("keydown", handleKeypress);
    return () => window.removeEventListener("keydown", handleKeypress);
  }, [setIsActive, isActive, navigate]);

  return (
    <div className="MediumThumbnail">
      <img
        alt="Thumbnail"
        className="MediumThumbnail--thumb"
        tabIndex={1}
        src={file.url}
        onClick={imageClick}
      />
      <span
        className={`MediumThumbnail--full ${isActive ? "active" : null}`}
        id={elementId}
        onClick={imageClick}
      >
        <PushButton
          isPlain={true}
          disableTimeout={true}
          onClick={() => navigate(-1)}
        >
          <ChevronLeftIcon className="icon" />
        </PushButton>
        <img alt="Full resolution" src={file.url} />
        <PushButton
          isPlain={true}
          disableTimeout={true}
          onClick={() => navigate(+1)}
        >
          <ChevronRightIcon className="icon" />
        </PushButton>
      </span>
    </div>
  );
};

export { MediumThumbnail };

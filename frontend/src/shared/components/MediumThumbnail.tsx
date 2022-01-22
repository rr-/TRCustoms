import "./MediumThumbnail.css";
import { PlayIcon } from "@heroicons/react/outline";
import { ChevronLeftIcon } from "@heroicons/react/outline";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { uniqueId } from "lodash";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import type { UploadedFile } from "src/services/file.service";
import { PushButton } from "src/shared/components/PushButton";
import { KEY_ESCAPE } from "src/shared/constants";
import { KEY_LEFT } from "src/shared/constants";
import { KEY_RIGHT } from "src/shared/constants";
import { getYoutubeVideoID } from "src/shared/utils";

interface MediumProps {
  file?: UploadedFile;
  link?: string;
}

const MediumThumbnail = ({ file, link }: MediumProps) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [elementId] = useState(uniqueId("mediumThumbnail-"));

  const onImageClick = () => {
    setIsActive(!isActive);
  };

  const navigate = useCallback(
    (direction: number) => {
      setIsActive(false);
      const allThumbnails = [
        ...document.getElementsByClassName("MediumThumbnail--full"),
      ] as HTMLElement[];
      let chosenElement: HTMLElement | null = null;
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

  const handleKeypress = useCallback(
    (event: KeyboardEvent) => {
      if (isActive) {
        if (event.keyCode === KEY_ESCAPE) {
          setIsActive(false);
        } else if (event.keyCode === KEY_LEFT) {
          navigate(-1);
        } else if (event.keyCode === KEY_RIGHT) {
          navigate(+1);
        }
      }
    },
    [navigate, isActive]
  );

  const onLoad = () => {
    window.addEventListener("keydown", handleKeypress);
    return () => window.removeEventListener("keydown", handleKeypress);
  };

  useEffect(onLoad, [handleKeypress]);

  if (file) {
    return (
      <div className="MediumThumbnail">
        <img
          alt="Thumbnail"
          className="MediumThumbnail--thumb"
          tabIndex={1}
          src={file.url}
          onClick={onImageClick}
        />
        <span
          className={`MediumThumbnail--full ${isActive ? "active" : null}`}
          id={elementId}
          onClick={onImageClick}
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
  } else if (link) {
    const youtubeVideoID = getYoutubeVideoID(link);
    if (youtubeVideoID) {
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoID}/mqdefault.jpg`;
      return (
        <a
          className="MediumThumbnail"
          target="_blank"
          rel="noreferrer noopener"
          href={link}
        >
          <img
            alt="Thumbnail"
            className="MediumThumbnail--thumb"
            src={thumbnailUrl}
            onClick={onImageClick}
          />
          <span className="MediumThumbnail--overlay">
            <PlayIcon className="icon" />
          </span>
        </a>
      );
    }
  }
  return null;
};

export { MediumThumbnail };

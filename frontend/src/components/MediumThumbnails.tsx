import "./MediumThumbnails.css";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { PushButton } from "src/components/PushButton";
import { IconChevronLeft } from "src/components/icons";
import { IconChevronRight } from "src/components/icons";
import { IconPlay } from "src/components/icons";
import { KEY_ESCAPE } from "src/constants";
import { KEY_LEFT } from "src/constants";
import { KEY_RIGHT } from "src/constants";
import type { UploadedFile } from "src/services/FileService";
import { DisplayMode } from "src/types";
import { getYoutubeVideoID } from "src/utils";

interface MediumThumbnailModalProps {
  file?: UploadedFile | undefined;
  canNavigateLeft: boolean;
  canNavigateRight: boolean;
  onNavigate: (file: UploadedFile, direction: number) => void;
  onClose: () => void;
}

const MediumThumbnailModal = ({
  file,
  onNavigate,
  canNavigateLeft,
  canNavigateRight,
  onClose,
}: MediumThumbnailModalProps) => {
  const handleModalClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  useEffect(() => {
    document.body.classList.toggle("modal-open", !!file);
  }, [file]);

  const handleWheel = (event: React.WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (file) {
      onNavigate(file, event.deltaY > 0 ? +1 : -1);
    }
  };

  return (
    <span
      className={`MediumThumbnailModal ${file ? "active" : ""}`}
      onMouseDown={handleModalClick}
      onWheel={handleWheel}
    >
      {file && (
        <>
          <PushButton
            className={
              canNavigateLeft ? "" : canNavigateRight ? "disabled" : "hidden"
            }
            isPlain={true}
            disableTimeout={true}
            onClick={() => onNavigate(file, -1)}
          >
            <IconChevronLeft />
          </PushButton>

          <img
            onMouseDown={handleModalClick}
            alt="Full resolution"
            src={file.url}
          />

          <PushButton
            className={
              canNavigateRight ? "" : canNavigateLeft ? "disabled" : "hidden"
            }
            isPlain={true}
            disableTimeout={true}
            onClick={() => onNavigate(file, +1)}
          >
            <IconChevronRight />
          </PushButton>
        </>
      )}
    </span>
  );
};

interface MediumThumbnailProps {
  file?: UploadedFile | undefined;
  link?: string | undefined;
  displayMode: DisplayMode;
  onActivate: (file: UploadedFile) => void;
}

const MediumThumbnail = ({
  file,
  link,
  displayMode,
  onActivate,
}: MediumThumbnailProps) => {
  const classNames = ["MediumThumbnail"];
  switch (displayMode) {
    case DisplayMode.Cover:
      classNames.push("cover");
      break;
    case DisplayMode.Contain:
      classNames.push("contain");
      break;
  }

  if (file) {
    return (
      <div className={classNames.join(" ")}>
        <img
          alt="Thumbnail"
          className="MediumThumbnail--thumb"
          tabIndex={1}
          src={file.url}
          onClick={() => onActivate(file)}
        />
      </div>
    );
  } else if (link) {
    const youtubeVideoID = getYoutubeVideoID(link);
    if (youtubeVideoID) {
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoID}/mqdefault.jpg`;
      return (
        <a
          className={classNames.join(" ")}
          target="_blank"
          rel="noreferrer noopener"
          href={link}
        >
          <img
            alt="Thumbnail"
            className="MediumThumbnail--thumb"
            src={thumbnailUrl}
          />
          <span className="MediumThumbnail--overlay">
            <IconPlay />
          </span>
        </a>
      );
    }
  }

  return (
    <div className="MediumThumbnail">
      <div className="MediumThumbnail--thumb"></div>
    </div>
  );
};

export { MediumThumbnail };

interface MediumThumbnailsProps {
  files: UploadedFile[];
  links: string[];
  displayMode: DisplayMode;
}

const MediumThumbnails = ({
  displayMode,
  files,
  links,
}: MediumThumbnailsProps) => {
  const [activeFile, setActiveFile] = useState<UploadedFile | undefined>();
  const [canNavigateLeft, setCanNavigateLeft] = useState(false);
  const [canNavigateRight, setCanNavigateRight] = useState(false);

  useEffect(() => {
    setCanNavigateLeft(activeFile ? files.indexOf(activeFile) > 0 : false);
    setCanNavigateRight(
      activeFile ? files.indexOf(activeFile) < files.length - 1 : false
    );
  }, [files, activeFile]);

  const handleActivate = useCallback((file: UploadedFile) => {
    setActiveFile(file);
  }, []);

  const handleClose = useCallback(() => {
    setActiveFile(undefined);
  }, []);

  const handleNavigate = useCallback(
    (file: UploadedFile, direction: number) => {
      if (
        (direction === +1 && !canNavigateRight) ||
        (direction === -1 && !canNavigateLeft)
      ) {
        return;
      }
      const curIndex = files.indexOf(file);
      const newIndex = (curIndex + direction + files.length) % files.length;
      setActiveFile(files[newIndex]);
    },
    [files, canNavigateLeft, canNavigateRight]
  );

  const handleKeypress = useCallback(
    (event: KeyboardEvent) => {
      if (activeFile !== undefined) {
        if (event.keyCode === KEY_ESCAPE) {
          handleClose();
        } else if (event.keyCode === KEY_LEFT) {
          handleNavigate(activeFile, -1);
        } else if (event.keyCode === KEY_RIGHT) {
          handleNavigate(activeFile, +1);
        }
      }
    },
    [handleClose, handleNavigate, activeFile]
  );

  const handleLoad = () => {
    window.addEventListener("keydown", handleKeypress);
    return () => window.removeEventListener("keydown", handleKeypress);
  };

  useEffect(handleLoad, [handleKeypress]);

  return (
    <div className="MediumThumbnails">
      <MediumThumbnailModal
        file={activeFile}
        canNavigateLeft={canNavigateLeft}
        canNavigateRight={canNavigateRight}
        onNavigate={handleNavigate}
        onClose={handleClose}
      />

      {links.map((link) => (
        <MediumThumbnail
          displayMode={displayMode}
          key={link}
          link={link}
          onActivate={handleActivate}
        />
      ))}
      {files.map((file) => (
        <MediumThumbnail
          displayMode={displayMode}
          key={file.id}
          file={file}
          onActivate={handleActivate}
        />
      ))}
    </div>
  );
};

export { MediumThumbnails };

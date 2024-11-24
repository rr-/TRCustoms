import styles from "./index.module.css";
import { TouchEvent } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "src/components/common/Link";
import { IconChevronLeft } from "src/components/icons";
import { IconChevronRight } from "src/components/icons";
import { IconPlay } from "src/components/icons";
import { Dim } from "src/components/modals/Dim";
import { KEY_ESCAPE } from "src/constants";
import { KEY_LEFT } from "src/constants";
import { KEY_RIGHT } from "src/constants";
import type { UploadedFile } from "src/services/FileService";
import { DisplayMode } from "src/types";
import { parseYoutubeLink } from "src/utils/misc";

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
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleDimClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.changedTouches[0].screenX);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.changedTouches[0].screenX);
    if (Math.abs(touchEndX - touchStartX) < 10) {
      return;
    }
    if (file) {
      onNavigate(file, touchEndX < touchStartX ? +1 : -1);
    }
  };

  const handleDimWheel = (event: React.WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (file) {
      onNavigate(file, event.deltaY > 0 ? +1 : -1);
    }
  };

  const handleImageMouseDown = (event: React.MouseEvent) => {
    if (event.button === 0) {
      event.preventDefault();
      handleDimClick(event);
    }
  };

  return (
    <Dim
      isActive={!!file}
      className={styles.modal}
      onMouseDown={handleDimClick}
      onWheel={handleDimWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {file && (
        <>
          <Link
            className={`${styles.navButton} ${
              canNavigateLeft
                ? ""
                : canNavigateRight
                ? styles.disabled
                : styles.hidden
            }`}
            onClick={() => onNavigate(file, -1)}
          >
            <IconChevronLeft />
          </Link>

          <img
            onMouseDown={handleImageMouseDown}
            alt="Full resolution"
            src={file.url}
          />

          <Link
            className={`${styles.navButton} ${
              canNavigateRight
                ? ""
                : canNavigateLeft
                ? styles.disabled
                : styles.hidden
            }`}
            onClick={() => onNavigate(file, +1)}
          >
            <IconChevronRight />
          </Link>
        </>
      )}
    </Dim>
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
  const classNames = [styles.mediumThumbnail];
  switch (displayMode) {
    case DisplayMode.Cover:
      classNames.push(styles.cover);
      break;
    case DisplayMode.Contain:
      classNames.push(styles.contain);
      break;
  }

  if (file) {
    return (
      <div className={classNames.join(" ")}>
        <img className={styles.backgroundBlur} src={file.url} />
        <img
          alt="Thumbnail"
          className={styles.mediumThumbnailThumb}
          role="link"
          tabIndex={1}
          src={file.url}
          onClick={() => onActivate(file)}
        />
      </div>
    );
  } else if (link) {
    const youtubeLink = parseYoutubeLink(link);
    if (youtubeLink?.videoID) {
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeLink.videoID}/mqdefault.jpg`;
      return (
        <a
          className={classNames.join(" ")}
          target="_blank"
          rel="noreferrer noopener"
          href={link}
        >
          <img className={styles.backgroundBlur} src={thumbnailUrl} />
          <img
            alt="Thumbnail"
            className={styles.mediumThumbnailThumb}
            src={thumbnailUrl}
          />
          <span className={styles.mediumThumbnailOverlay}>
            <IconPlay />
          </span>
        </a>
      );
    }
  }

  return (
    <div className={styles.mediumThumbnail}>
      <div className={styles.mediumThumbnailThumb}></div>
    </div>
  );
};

export { MediumThumbnail };

interface MediumThumbnailsProps {
  files: UploadedFile[];
  links: string[];
  displayMode: DisplayMode;
  className?: string | undefined;
}

const MediumThumbnails = ({
  displayMode,
  files,
  links,
  className,
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
    <div className={`${styles.thumbnails} ${className || ""}`}>
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

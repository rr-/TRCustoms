import styles from "./index.module.css";
import { useState } from "react";
import { FilePicker } from "src/components/common/FilePicker";
import type { FilePickerPreviewProps } from "src/components/common/FilePicker";
import { UploadType } from "src/services/FileService";
import { DisplayMode } from "src/types";

interface PicturePickerProps {
  label?: React.ReactNode | undefined;
  uploadType: UploadType;
  fileIds?: number[] | undefined;
  onError?: ((error: unknown) => void) | undefined;
  onChange?: ((fileIds: number[]) => void) | undefined;
  allowMultiple?: boolean | undefined;
  allowClear: boolean;
  displayMode: DisplayMode;
}

interface PicturePickerPreviewProps extends FilePickerPreviewProps {
  displayMode: DisplayMode;
}

const COVER_ASPECT_RATIO = 4 / 3;

const getCropInsets = (width: number, height: number) => {
  const aspectRatio = width / height;
  if (aspectRatio > COVER_ASPECT_RATIO) {
    return { x: (1 - COVER_ASPECT_RATIO / aspectRatio) / 2, y: 0 };
  }
  return { x: 0, y: (1 - aspectRatio / COVER_ASPECT_RATIO) / 2 };
};

const toPercent = (value: number) => `${value * 100}%`;

const CoverCropPreview = ({ uploadedFile }: FilePickerPreviewProps) => {
  const [insets, setInsets] = useState<{ x: number; y: number } | null>(null);
  const isCropped = !!insets && (insets.x > 0.005 || insets.y > 0.005);

  return (
    <div className={styles.crop}>
      {isCropped && (
        <p className={styles.cropCaption}>
          Everything outside the box below will be cropped:
        </p>
      )}
      <div className={styles.cropImage}>
        <img
          src={uploadedFile.url ?? undefined}
          alt="Upload preview"
          onLoad={(event) =>
            setInsets(
              getCropInsets(
                event.currentTarget.naturalWidth,
                event.currentTarget.naturalHeight,
              ),
            )
          }
        />
        {isCropped && (
          <>
            {insets.x > 0 ? (
              <>
                <span
                  className={styles.cropMask}
                  style={{
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: toPercent(insets.x),
                  }}
                />
                <span
                  className={styles.cropMask}
                  style={{
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: toPercent(insets.x),
                  }}
                />
              </>
            ) : (
              <>
                <span
                  className={styles.cropMask}
                  style={{
                    left: 0,
                    right: 0,
                    top: 0,
                    height: toPercent(insets.y),
                  }}
                />
                <span
                  className={styles.cropMask}
                  style={{
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: toPercent(insets.y),
                  }}
                />
              </>
            )}
            <span
              className={styles.cropBox}
              aria-label="Cover crop area"
              style={{
                top: toPercent(insets.y),
                bottom: toPercent(insets.y),
                left: toPercent(insets.x),
                right: toPercent(insets.x),
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

const PicturePickerPreview = ({
  uploadedFile,
  displayMode,
}: PicturePickerPreviewProps) => {
  if (displayMode === DisplayMode.Cover) {
    return <CoverCropPreview uploadedFile={uploadedFile} />;
  }
  return (
    <img
      className={`${styles.wrapper} ${styles.contain}`}
      src={uploadedFile.url ?? undefined}
      alt="Upload preview"
    />
  );
};

const PicturePicker = ({
  label,
  displayMode,
  ...props
}: PicturePickerProps) => {
  return (
    <FilePicker
      {...props}
      label={
        label ? (
          label
        ) : props.allowMultiple ? (
          <>Drop images here, or click on this box.</>
        ) : (
          <>Drop an image here, or click on this box.</>
        )
      }
      previewWidget={({ uploadedFile }: FilePickerPreviewProps) => (
        <PicturePickerPreview
          uploadedFile={uploadedFile}
          displayMode={displayMode}
        />
      )}
    />
  );
};

export { PicturePicker };

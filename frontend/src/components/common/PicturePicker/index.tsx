import styles from "./index.module.css";
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

const PicturePickerPreview = ({
  uploadedFile,
  displayMode,
}: PicturePickerPreviewProps) => {
  const classNames = [styles.wrapper];
  switch (displayMode) {
    case DisplayMode.Cover:
      classNames.push(styles.cover);
      break;
    case DisplayMode.Contain:
      classNames.push(styles.contain);
      break;
  }
  return (
    <img
      className={classNames.join(" ")}
      src={uploadedFile.url}
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

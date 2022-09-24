import "./index.css";
import { FilePicker } from "src/components/FilePicker";
import type { FilePickerPreviewProps } from "src/components/FilePicker";
import { UploadType } from "src/services/FileService";
import { DisplayMode } from "src/types";

interface PicturePickerProps {
  label?: React.ReactNode | undefined;
  uploadType: UploadType;
  fileIds?: number[] | undefined;
  onError?: ((error: any) => void) | undefined;
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
  const classNames = ["PicturePickerPreview"];
  switch (displayMode) {
    case DisplayMode.Cover:
      classNames.push("cover");
      break;
    case DisplayMode.Contain:
      classNames.push("contain");
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

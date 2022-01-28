import "./PicturePicker.css";
import { UploadType } from "src/services/file.service";
import { FilePicker } from "src/shared/components/FilePicker";
import type { FilePickerPreviewProps } from "src/shared/components/FilePicker";
import { DisplayMode } from "src/shared/types";

interface PicturePickerProps {
  label?: React.ReactNode;
  uploadType: UploadType;
  fileIds?: number[] | null;
  onError?: (error: any) => void;
  onChange?: (fileIds: number[]) => void;
  allowMultiple?: boolean;
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

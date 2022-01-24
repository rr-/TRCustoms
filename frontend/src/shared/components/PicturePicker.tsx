import "./PicturePicker.css";
import { UploadType } from "src/services/file.service";
import { FilePicker } from "src/shared/components/FilePicker";
import type { FilePickerPreviewProps } from "src/shared/components/FilePicker";
import { DisplayMode } from "src/shared/types";

interface PicturePickerProps {
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

const PicturePicker = (props: PicturePickerProps) => {
  return (
    <FilePicker
      {...props}
      previewWidget={({ uploadedFile }: FilePickerPreviewProps) => (
        <PicturePickerPreview
          uploadedFile={uploadedFile}
          displayMode={props.displayMode}
        />
      )}
    />
  );
};

export { PicturePicker };

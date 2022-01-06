import "./PicturePicker.css";
import { UploadType } from "src/services/file.service";
import { FilePicker } from "src/shared/components/FilePicker";
import type { FilePickerPreviewProps } from "src/shared/components/FilePicker";

interface PicturePickerProps {
  uploadType: UploadType;
  fileIds?: number[] | null;
  onError?: (error: any) => void;
  onChange?: (fileIds: number[]) => void;
  allowMultiple?: boolean;
  allowClear: boolean;
}

const PicturePickerPreview = ({ uploadedFile }: FilePickerPreviewProps) => {
  return (
    <img
      className="PicturePickerPreview"
      src={uploadedFile.url}
      alt="Upload preview"
    />
  );
};

const PicturePicker = (props: PicturePickerProps) => {
  return <FilePicker {...props} previewWidget={PicturePickerPreview} />;
};

export { PicturePicker };

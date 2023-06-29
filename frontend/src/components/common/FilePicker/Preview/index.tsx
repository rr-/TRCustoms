import styles from "./index.module.css";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "src/components/common/Link";
import { Loader } from "src/components/common/Loader";
import type { UploadedFile } from "src/services/FileService";
import { FileService } from "src/services/FileService";
import { formatFileSize } from "src/utils/string";

interface FilePickerPreviewProps {
  uploadedFile: UploadedFile;
}

const FilePickerPreview = ({ uploadedFile }: FilePickerPreviewProps) => {
  return <>{`${uploadedFile.md5sum} (${formatFileSize(uploadedFile.size)})`}</>;
};

interface FilePickerPreviewWrapperProps {
  allowClear: boolean;
  position: number;
  fileId: number;
  clearFile: (fileId: number) => void;
  previewWidget: typeof FilePickerPreview;
  reorderSourcePosition: number | null;
  setReorderSourcePosition: (fileId: number | null) => void;
}

const FilePickerPreviewWrapper = ({
  allowClear,
  position,
  fileId,
  clearFile,
  previewWidget,
  reorderSourcePosition,
  setReorderSourcePosition,
}: FilePickerPreviewWrapperProps) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const ReorderEvents = {
    onDragStart: (event: React.DragEvent) => {
      window.setTimeout(() => {
        setReorderSourcePosition(position);
      }, 0);
    },
    onDragEnd: (event: React.DragEvent) => {
      setReorderSourcePosition(null);
    },
  };

  useEffect(() => {
    const run = async () => {
      setUploadedFile(await FileService.getFileById(fileId));
    };
    run();
  }, [fileId]);

  const classNames = [];
  if (reorderSourcePosition === position) {
    classNames.push(styles.reorderSource);
  }

  return (
    <div>
      <div
        className={classNames.join(" ")}
        draggable={true}
        onDragStart={ReorderEvents.onDragStart}
        onDragEnd={ReorderEvents.onDragEnd}
      >
        {uploadedFile ? previewWidget({ uploadedFile }) : <Loader />}
        {allowClear && (
          <>
            <br />
            <Link onClick={() => clearFile(fileId)}>Remove</Link>
          </>
        )}
      </div>
    </div>
  );
};

export type { FilePickerPreviewProps };
export { FilePickerPreviewWrapper, FilePickerPreview };

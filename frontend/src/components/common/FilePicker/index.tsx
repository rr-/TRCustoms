import { FilePickerPreview } from "./Preview";
import type { FilePickerPreviewProps } from "./Preview";
import { FilePickerPreviewWrapper } from "./Preview";
import { FilePickerReorderTarget } from "./ReorderTarget";
import styles from "./index.module.css";
import { useCallback } from "react";
import { Fragment } from "react";
import { useState } from "react";
import { FileUploader } from "src/components/common/FileUploader";
import type { UploadedFile } from "src/services/FileService";
import { UploadType } from "src/services/FileService";
import { extractErrorMessage } from "src/utils/misc";

interface FilePickerProps {
  uploadType: UploadType;
  label?: React.ReactNode | undefined;
  fileIds?: number[] | undefined;
  onError?: ((error: unknown) => void) | undefined;
  onChange?: ((fileIds: number[]) => void) | undefined;
  allowMultiple?: boolean | undefined;
  allowClear: boolean;
  previewWidget?: typeof FilePickerPreview | undefined;
}

const FilePicker = ({
  allowClear,
  allowMultiple,
  fileIds,
  uploadType,
  previewWidget,
  onError,
  label,
  onChange,
}: FilePickerProps) => {
  const [currentFileIds, setCurrentFileIds] = useState<number[]>(fileIds || []);
  const [reorderSourcePosition, setReorderSourcePosition] = useState<
    number | null
  >(null);
  const [reorderTargetPosition, setReorderTargetPosition] = useState<
    number | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearFile = useCallback(
    (fileId: number) => {
      setErrorMessage(null);
      const newFileIds = [...currentFileIds.filter((id) => id !== fileId)];
      setCurrentFileIds(newFileIds);
      onChange?.(newFileIds);
    },
    [setErrorMessage, setCurrentFileIds, onChange, currentFileIds]
  );

  const reorderFiles = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }
    const newFileIds = [...currentFileIds];
    var fileId = newFileIds[oldIndex];
    newFileIds.splice(oldIndex, 1);
    newFileIds.splice(newIndex, 0, fileId);
    setCurrentFileIds(newFileIds);
    onChange?.(newFileIds);
  };

  const handleUploadError = useCallback(
    (error: unknown) => {
      setErrorMessage(extractErrorMessage(error));
    },
    [setErrorMessage]
  );

  const handleUploadFinish = useCallback(
    (uploadedFiles: UploadedFile[]) => {
      const newFileIds = [
        ...(allowMultiple ? currentFileIds : []),
        ...uploadedFiles.map((uploadedFile) => uploadedFile.id),
      ];
      setCurrentFileIds(newFileIds);
      onChange?.(newFileIds);
    },
    [allowMultiple, onChange, currentFileIds]
  );

  return (
    <div className={styles.wrapper}>
      <FileUploader
        uploadType={uploadType}
        allowMultiple={allowMultiple}
        onUploadFinish={handleUploadFinish}
        onUploadError={handleUploadError}
        label={label}
      />
      <div className={styles.previews}>
        {currentFileIds.length > 1 ? (
          <FilePickerReorderTarget
            position={0}
            reorderSourcePosition={reorderSourcePosition}
            reorderTargetPosition={reorderTargetPosition}
            setReorderSourcePosition={setReorderSourcePosition}
            setReorderTargetPosition={setReorderTargetPosition}
            onReorder={reorderFiles}
          />
        ) : null}
        {currentFileIds.map((fileId, position) => (
          <Fragment key={fileId}>
            <FilePickerPreviewWrapper
              position={position}
              allowClear={allowClear}
              clearFile={clearFile}
              fileId={fileId}
              previewWidget={previewWidget || FilePickerPreview}
              reorderSourcePosition={reorderSourcePosition}
              setReorderSourcePosition={setReorderSourcePosition}
            />
            {currentFileIds.length > 1 ? (
              <FilePickerReorderTarget
                position={position + 1}
                reorderSourcePosition={reorderSourcePosition}
                reorderTargetPosition={reorderTargetPosition}
                setReorderSourcePosition={setReorderSourcePosition}
                setReorderTargetPosition={setReorderTargetPosition}
                onReorder={reorderFiles}
              />
            ) : null}
          </Fragment>
        ))}
      </div>
      {errorMessage && <div className="FormFieldError">{errorMessage}</div>}
    </div>
  );
};

export type { FilePickerProps, FilePickerPreviewProps };
export { FilePicker };

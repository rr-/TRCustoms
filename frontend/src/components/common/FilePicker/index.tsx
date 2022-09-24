import "./index.css";
import { useCallback } from "react";
import { Fragment } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { FileUploader } from "src/components/common/FileUploader";
import { Link } from "src/components/common/Link";
import { Loader } from "src/components/common/Loader";
import type { UploadedFile } from "src/services/FileService";
import { FileService } from "src/services/FileService";
import { UploadType } from "src/services/FileService";
import { extractErrorMessage } from "src/utils/misc";
import { formatFileSize } from "src/utils/string";

interface FilePickerPreviewProps {
  uploadedFile: UploadedFile;
}

const FilePickerPreview = ({ uploadedFile }: FilePickerPreviewProps) => {
  return <>{`${uploadedFile.md5sum} (${formatFileSize(uploadedFile.size)})`}</>;
};

interface FilePickerReorderTargetProps {
  position: number;
  reorderSourcePosition: number | null;
  reorderTargetPosition: number | null;
  setReorderSourcePosition: (position: number | null) => void;
  setReorderTargetPosition: (position: number | null) => void;
  onReorder: (position: number, targetPosition: number) => void;
}

const FilePickerReorderTarget = ({
  position,
  reorderSourcePosition,
  reorderTargetPosition,
  setReorderSourcePosition,
  setReorderTargetPosition,
  onReorder,
}: FilePickerReorderTargetProps) => {
  const ReorderEvents = {
    onDragEnter: (event: React.DragEvent) => {
      setReorderTargetPosition(position);
    },
    onDragLeave: (event: React.DragEvent) => {
      setReorderTargetPosition(null);
    },
    onDrop: (event: React.DragEvent) => {
      setReorderSourcePosition(null);
      setReorderTargetPosition(null);
      if (reorderSourcePosition !== null && reorderTargetPosition !== null) {
        const oldIndex = reorderSourcePosition;
        const newIndex =
          reorderTargetPosition > reorderSourcePosition
            ? reorderTargetPosition - 1
            : reorderTargetPosition;
        onReorder(oldIndex, newIndex);
      }
    },
  };

  return (
    <div
      className={`FilePickerReorderTarget ${
        reorderSourcePosition !== null ? "dropActive" : ""
      } ${reorderTargetPosition === position ? "active" : ""}`}
    >
      <div
        className="FilePickerReorderTarget--zone"
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
        onDragOver={(event) => event.preventDefault()}
        onDragEnter={(event) => ReorderEvents.onDragEnter(event)}
        onDragLeave={(event) => ReorderEvents.onDragLeave(event)}
        onDrop={(event) => ReorderEvents.onDrop(event)}
      >
        <div className="FilePickerReorderTarget--divider" />
      </div>
    </div>
  );
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
    classNames.push("FilePickerPreviewWrapper--reorderSource");
  }

  return (
    <div className="FilePickerPreviewWrapper">
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

interface FilePickerProps {
  uploadType: UploadType;
  label?: React.ReactNode | undefined;
  fileIds?: number[] | undefined;
  onError?: ((error: any) => void) | undefined;
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
    (fileId) => {
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
    (error: any) => {
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
    <div className="FilePicker">
      <FileUploader
        uploadType={uploadType}
        allowMultiple={allowMultiple}
        onUploadFinish={handleUploadFinish}
        onUploadError={handleUploadError}
        label={label}
      />
      <div className="FilePicker--previews">
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

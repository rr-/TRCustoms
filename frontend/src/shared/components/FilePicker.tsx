import "./FilePicker.css";
import { AxiosError } from "axios";
import axios from "axios";
import { uniqueId } from "lodash";
import { Fragment } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import type { UploadedFile } from "src/services/file.service";
import { FileService } from "src/services/file.service";
import { UploadType } from "src/services/file.service";
import { Loader } from "src/shared/components/Loader";
import { ProgressBar } from "src/shared/components/ProgressBar";
import { PushButton } from "src/shared/components/PushButton";
import { formatFileSize } from "src/shared/utils";

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
            <PushButton isPlain={true} onClick={() => clearFile(fileId)}>
              Remove
            </PushButton>
          </>
        )}
      </div>
    </div>
  );
};

interface FilePickerProps {
  label?: React.ReactNode | undefined;
  uploadType: UploadType;
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
  const [percentCompleted, setPercentCompleted] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState(0);
  const [elementId] = useState(uniqueId("pictureDropper-"));

  const isUploading = percentCompleted !== null;

  const handleError = useCallback(
    (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        setErrorMessage(axiosError.response?.data.content);
      } else {
        setErrorMessage("Unknown error.");
      }
      onError?.(error);
    },
    [onError]
  );

  const clearFile = useCallback(
    (fileId) => {
      setErrorMessage(null);
      const newFileIds = [...currentFileIds.filter((id) => id !== fileId)];
      setCurrentFileIds(newFileIds);
      onChange?.(newFileIds);
    },
    [setErrorMessage, setCurrentFileIds, onChange, currentFileIds]
  );

  const addFile = useCallback(
    (file) => {
      setErrorMessage(null);
      const handleUploadProgress = (progressEvent: ProgressEvent) => {
        setPercentCompleted(
          (progressEvent.loaded * 100.0) / progressEvent.total
        );
      };

      const run = async () => {
        try {
          const uploadedFile = await FileService.uploadFile(
            file,
            uploadType,
            handleUploadProgress
          );
          const newFileIds = [
            ...(allowMultiple ? currentFileIds : []),
            uploadedFile.id,
          ];
          setPercentCompleted(null);
          setCurrentFileIds(newFileIds);
          onChange?.(newFileIds);
        } catch (error) {
          setPercentCompleted(null);
          handleError(error);
        }
      };
      run();
    },
    [
      setErrorMessage,
      handleError,
      uploadType,
      setCurrentFileIds,
      setPercentCompleted,
      onChange,
      currentFileIds,
      allowMultiple,
    ]
  );

  const UploadEvents = {
    onDragEnter: (event: React.DragEvent) => {
      if (isUploading) {
        return;
      }
      setDragCounter((dragCounter) => dragCounter + 1);
    },

    onDragLeave: (event: React.DragEvent) => {
      if (isUploading) {
        return;
      }
      setDragCounter((dragCounter) => Math.max(0, dragCounter - 1));
    },

    onDragOver: (event: React.DragEvent) => {
      if (isUploading) {
        return;
      }
      event.preventDefault();
    },

    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      if (isUploading) {
        return;
      }
      setDragCounter(0);
      if (!event.dataTransfer.files.length) {
        window.alert("Only files are supported.");
      }
      if (!allowMultiple && event.dataTransfer.files.length > 1) {
        window.alert("Cannot select multiple files.");
      }
      addFile(event.dataTransfer.files[0]);
    },

    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isUploading) {
        return;
      }
      const input = event.currentTarget as HTMLInputElement;
      if (!input.files) {
        return;
      }
      for (let file of input.files) {
        addFile(file);
        if (!allowMultiple) {
          break;
        }
      }
    },
  };

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

  return (
    <div className="FilePicker">
      <input
        multiple={allowMultiple}
        className="FilePicker--fileInput"
        id={elementId}
        type="file"
        onChange={(event) => UploadEvents.onFileChange(event)}
      />
      <label
        htmlFor={elementId}
        className={`FilePicker--dropArea ${dragCounter ? "active" : ""}`}
        onDragEnter={(event) => UploadEvents.onDragEnter(event)}
        onDragLeave={(event) => UploadEvents.onDragLeave(event)}
        onDragOver={(event) => UploadEvents.onDragOver(event)}
        onDrop={(event) => UploadEvents.onDrop(event)}
      >
        {isUploading ? (
          <>
            <ProgressBar
              title="Uploading…"
              percentCompleted={percentCompleted}
            />
          </>
        ) : label ? (
          label
        ) : allowMultiple ? (
          <>Drop files here, or click on this box.</>
        ) : (
          <>Drop a file here, or click on this box.</>
        )}
      </label>
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

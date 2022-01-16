import "./FilePicker.css";
import { AxiosError } from "axios";
import axios from "axios";
import { uniqueId } from "lodash";
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

interface FilePickerPreviewWrapperProps {
  allowClear: boolean;
  fileId: number;
  clearFile: (fileId: number) => void;
  previewWidget: typeof FilePickerPreview;
}

const FilePickerPreviewWrapper = ({
  allowClear,
  fileId,
  clearFile,
  previewWidget,
}: FilePickerPreviewWrapperProps) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  useEffect(() => {
    const run = async () => {
      setUploadedFile(await FileService.getFileById(fileId));
    };
    run();
  }, [fileId]);

  return (
    <div className="FilePickerPreviewWrapper">
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
  );
};

interface FilePickerProps {
  uploadType: UploadType;
  fileIds?: number[] | null;
  onError?: (error: any) => void;
  onChange?: (fileIds: number[]) => void;
  allowMultiple?: boolean;
  allowClear: boolean;
  previewWidget?: typeof FilePickerPreview;
}

const FilePicker = ({
  allowClear,
  allowMultiple,
  fileIds,
  uploadType,
  previewWidget,
  onError,
  onChange,
}: FilePickerProps) => {
  const [currentFileIds, setCurrentFileIds] = useState<number[]>(fileIds || []);
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
      const onUploadProgress = (progressEvent: ProgressEvent) => {
        setPercentCompleted(
          (progressEvent.loaded * 100.0) / progressEvent.total
        );
      };

      const run = async () => {
        try {
          const uploadedFile = await FileService.uploadFile(
            file,
            uploadType,
            onUploadProgress
          );
          const newFileIds = [
            ...(allowMultiple ? currentFileIds : []),
            uploadedFile.id,
          ];
          setPercentCompleted(null);
          setCurrentFileIds(newFileIds);
          onChange?.(newFileIds);
        } catch (error) {
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

  const onDragEnter = (event: React.DragEvent) => {
    if (isUploading) {
      return;
    }
    setDragCounter((dragCounter) => dragCounter + 1);
  };

  const onDragLeave = (event: React.DragEvent) => {
    if (isUploading) {
      return;
    }
    setDragCounter((dragCounter) => Math.max(0, dragCounter - 1));
  };

  const onDragOver = (event: React.DragEvent) => {
    if (isUploading) {
      return;
    }
    event.preventDefault();
  };

  const onDrop = (event: React.DragEvent) => {
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
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <div className="FilePicker">
      <input
        multiple={allowMultiple}
        className="FilePicker--fileInput"
        id={elementId}
        type="file"
        onChange={(event) => onFileChange(event)}
      />
      <label
        htmlFor={elementId}
        className={`FilePicker--dropArea ${dragCounter ? "active" : ""}`}
        onDragEnter={(event) => onDragEnter(event)}
        onDragLeave={(event) => onDragLeave(event)}
        onDragOver={(event) => onDragOver(event)}
        onDrop={(event) => onDrop(event)}
      >
        {isUploading ? (
          <>
            <ProgressBar
              title="Uploading…"
              percentCompleted={percentCompleted}
            />
          </>
        ) : allowMultiple ? (
          <>Drop files here, or click on this box.</>
        ) : (
          <>Drop a file here, or click on this box.</>
        )}
        <br />
        <div className="FilePicker--previews">
          {currentFileIds.map((fileId) => (
            <FilePickerPreviewWrapper
              key={fileId}
              allowClear={allowClear}
              clearFile={clearFile}
              fileId={fileId}
              previewWidget={previewWidget || FilePickerPreview}
            />
          ))}
        </div>
      </label>
      {errorMessage && <div className="FormFieldError">{errorMessage}</div>}
    </div>
  );
};

export type { FilePickerProps, FilePickerPreviewProps };
export { FilePicker };

import "./FileUploader.css";
import { uniqueId } from "lodash";
import { useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { ProgressBar } from "src/components/ProgressBar";
import type { UploadedFile } from "src/services/FileService";
import { FileService } from "src/services/FileService";
import { UploadType } from "src/services/FileService";

interface FileUploaderProps {
  uploadType: UploadType;
  allowMultiple?: boolean | undefined;
  disableProgressbar?: boolean | undefined;
  onUploadFinish?: ((uploadedFiles: UploadedFile[]) => void) | undefined;
  onUploadError?: ((error: any) => void) | undefined;
  onUploadPercentChange?: ((percent: number | null) => void) | undefined;
  label?: React.ReactNode | undefined;
}

const FileUploader = ({
  uploadType,
  allowMultiple,
  disableProgressbar,
  label,
  onUploadFinish,
  onUploadError,
  onUploadPercentChange,
}: FileUploaderProps) => {
  const [percentCompleted, setPercentCompleted] = useState<number | null>(null);
  const [elementId] = useState(uniqueId("FileUploader-"));
  const [dragCounter, setDragCounter] = useState(0);
  const isUploading = percentCompleted !== null;

  const handleError = useCallback(
    (error) => {
      onUploadError?.(error);
    },
    [onUploadError]
  );

  const addFiles = useCallback(
    (files: File[]) => {
      onUploadError?.(null);

      const run = async () => {
        try {
          const uploadedFiles = [];

          for (let file of files) {
            const handleUploadProgress = (progressEvent: ProgressEvent) => {
              setPercentCompleted(
                ((uploadedFiles.length +
                  progressEvent.loaded / progressEvent.total) *
                  100) /
                  files.length
              );
            };

            const uploadedFile = await FileService.uploadFile(
              file,
              uploadType,
              handleUploadProgress
            );

            uploadedFiles.push(uploadedFile);
          }

          setPercentCompleted(null);
          onUploadFinish?.(uploadedFiles);
        } catch (error) {
          setPercentCompleted(null);
          handleError(error);
        }
      };
      run();
    },
    [
      handleError,
      uploadType,
      setPercentCompleted,
      onUploadFinish,
      onUploadError,
    ]
  );

  useEffect(() => {
    onUploadPercentChange?.(percentCompleted);
  }, [percentCompleted, onUploadPercentChange]);

  const UploadEvents = {
    onClick: (event: React.MouseEvent) => {
      if (isUploading) {
        event.preventDefault();
        event.stopPropagation();
      }
    },

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
      addFiles([...event.dataTransfer.files]);
    },

    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isUploading) {
        return;
      }
      const input = event.currentTarget as HTMLInputElement;
      if (!input.files) {
        return;
      }
      addFiles(allowMultiple ? [...input.files] : [input.files[0]]);
    },
  };

  return (
    <div className="FileUploader">
      <input
        multiple={allowMultiple}
        className="FileUploader--input"
        id={elementId}
        type="file"
        onChange={(event) => UploadEvents.onFileChange(event)}
      />
      <label
        htmlFor={elementId}
        className={`FileUploader--dropArea ${dragCounter ? "active" : ""}`}
        onClick={(event) => UploadEvents.onClick(event)}
        onDragEnter={(event) => UploadEvents.onDragEnter(event)}
        onDragLeave={(event) => UploadEvents.onDragLeave(event)}
        onDragOver={(event) => UploadEvents.onDragOver(event)}
        onDrop={(event) => UploadEvents.onDrop(event)}
      >
        {isUploading && !disableProgressbar ? (
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
    </div>
  );
};

export { FileUploader };

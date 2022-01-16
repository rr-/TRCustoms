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
import { PushButton } from "src/shared/components/PushButton";

interface FilePickerPreviewProps {
  uploadedFile: UploadedFile;
}

const FilePickerPreview = ({ uploadedFile }: FilePickerPreviewProps) => {
  return <>{uploadedFile.url}</>;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState(0);
  const [elementId] = useState(uniqueId("pictureDropper-"));

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
      const run = async () => {
        try {
          const uploadedFile = await FileService.uploadFile(file, uploadType);
          const newFileIds = [
            ...(allowMultiple ? currentFileIds : []),
            uploadedFile.id,
          ];
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
      onChange,
      currentFileIds,
      allowMultiple,
    ]
  );

  const onDragEnter = useCallback(
    (event: React.DragEvent) => {
      setDragCounter((dragCounter) => dragCounter + 1);
    },
    [setDragCounter]
  );

  const onDragLeave = useCallback(
    (event: React.DragEvent) => {
      setDragCounter((dragCounter) => Math.max(0, dragCounter - 1));
    },
    [setDragCounter]
  );

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragCounter(0);
      if (!event.dataTransfer.files.length) {
        window.alert("Only files are supported.");
      }
      if (!allowMultiple && event.dataTransfer.files.length > 1) {
        window.alert("Cannot select multiple files.");
      }
      addFile(event.dataTransfer.files[0]);
    },
    [allowMultiple, setDragCounter, addFile]
  );

  const onFileChange = useCallback(
    (event) => {
      addFile(event.currentTarget.files[0]);
    },
    [addFile]
  );

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
        {allowMultiple ? (
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

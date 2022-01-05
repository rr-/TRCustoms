import "./PicturePicker.css";
import uniqueId from "lodash/uniqueId";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import type { UploadedFile } from "src/services/file.service";
import { FileService } from "src/services/file.service";
import { UploadType } from "src/services/file.service";
import { FetchError } from "src/shared/client";
import Loader from "src/shared/components/Loader";
import PushButton from "src/shared/components/PushButton";

interface PicturePickerProps {
  uploadType: UploadType;
  fileIds?: number[] | null;
  onError?: (error: any) => any;
  onChange?: (fileIds: number[]) => any;
  allowMultiple?: boolean;
  allowClear?: boolean;
}

interface PicturePickerPreviewProps {
  allowClear: boolean;
  fileId: number;
  clearFile: (fileId: number) => any;
}

const PicturePickerPreview = ({
  allowClear,
  fileId,
  clearFile,
}: PicturePickerPreviewProps) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile>(null);

  useEffect(() => {
    const run = async () => {
      setUploadedFile(await FileService.getFileById(fileId));
    };
    run();
  }, [fileId]);

  return (
    <div className="PicturePickerPreview">
      {uploadedFile ? (
        <img
          className="PicturePicker--image"
          src={uploadedFile.url}
          alt="Upload preview"
        />
      ) : (
        <Loader />
      )}
      {allowClear && (
        <>
          <br />
          <PushButton isPlain={true} onClick={() => clearFile(fileId)}>
            Delete
          </PushButton>
        </>
      )}
    </div>
  );
};

const PicturePicker = ({
  allowClear,
  allowMultiple,
  fileIds,
  uploadType,
  onError,
  onChange,
}: PicturePickerProps) => {
  const [currentFileIds, setCurrentFileIds] = useState<number[]>(fileIds || []);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [dragCounter, setDragCounter] = useState(0);
  const [elementId] = useState(uniqueId("pictureDropper-"));

  const handleError = useCallback(
    (error) => {
      if (error instanceof FetchError) {
        setErrorMessage(error.data?.content);
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
      onChange(newFileIds);
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
          onChange(newFileIds);
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
    (e) => {
      setDragCounter((dragCounter) => dragCounter + 1);
    },
    [setDragCounter]
  );

  const onDragLeave = useCallback(
    (e) => {
      setDragCounter((dragCounter) => Math.max(0, dragCounter - 1));
    },
    [setDragCounter]
  );

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragCounter(0);
      if (!e.dataTransfer.files.length) {
        window.alert("Only files are supported.");
      }
      if (!allowMultiple && e.dataTransfer.files.length > 1) {
        window.alert("Cannot select multiple files.");
      }
      addFile(e.dataTransfer.files[0]);
    },
    [allowMultiple, setDragCounter, addFile]
  );

  const onFileChange = useCallback(
    (e) => {
      addFile(e.currentTarget.files[0]);
    },
    [addFile]
  );

  return (
    <div className="PicturePicker">
      <input
        multiple={allowMultiple}
        className="PicturePicker--fileInput"
        id={elementId}
        type="file"
        onChange={(e) => onFileChange(e)}
      />
      <label
        htmlFor={elementId}
        className={`PicturePicker--dropArea ${dragCounter ? "active" : ""}`}
        onDragEnter={(e) => onDragEnter(e)}
        onDragLeave={(e) => onDragLeave(e)}
        onDragOver={(e) => onDragOver(e)}
        onDrop={(e) => onDrop(e)}
      >
        {allowMultiple ? (
          <>Drop images here, or click on this box.</>
        ) : (
          <>Drop an image here, or click on this box.</>
        )}
        <br />
        <div className="PicturePicker--previews">
          {currentFileIds.map((fileId) => (
            <PicturePickerPreview
              allowClear={allowClear}
              clearFile={clearFile}
              key={fileId}
              fileId={fileId}
            />
          ))}
        </div>
      </label>
      {errorMessage && <div className="FormFieldError">{errorMessage}</div>}
    </div>
  );
};

export default PicturePicker;

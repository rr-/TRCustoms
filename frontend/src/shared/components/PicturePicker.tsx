import "./PicturePicker.css";
import _uniqueId from "lodash/uniqueId";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { FileService } from "src/services/file.service";
import { UploadType } from "src/services/file.service";

interface PicturePickerProps {
  uploadType: UploadType;
  fileId?: number | null;
  onUploadError?: (error: any) => any;
  onUploadComplete?: (fileId: number | null) => any;
}

const PicturePicker = ({
  fileId,
  uploadType,
  onUploadError,
  onUploadComplete,
}: PicturePickerProps) => {
  const [currentFileId, setCurrentFileId] = useState<number | null>(fileId);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState(0);
  const [elementId] = useState(_uniqueId("pictureDropper-"));

  useEffect(() => {
    const run = async () => {
      if (
        currentFileId &&
        [
          UploadType.UserPicture,
          UploadType.LevelScreenshot,
          UploadType.LevelBanner,
        ].includes(uploadType)
      ) {
        const uploadedFile = await FileService.getFileById(currentFileId);
        setImageUrl(uploadedFile.content);
      }
    };
    run();
  }, [currentFileId, uploadType, setImageUrl]);

  const submitFile = useCallback(
    (file) => {
      const run = async () => {
        try {
          const uploadedFile = await FileService.uploadFile(file, uploadType);
          onUploadComplete(uploadedFile.id);
          setCurrentFileId(uploadedFile.id);
        } catch (error) {
          onUploadError(error);
        }
      };
      run();
    },
    [onUploadError, onUploadComplete, uploadType]
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
      if (e.dataTransfer.files.length > 1) {
        window.alert("Cannot select multiple files.");
      }
      submitFile(e.dataTransfer.files[0]);
    },
    [setDragCounter, submitFile]
  );

  const onFileChange = useCallback(
    (e) => {
      submitFile(e.currentTarget.files[0]);
    },
    [submitFile]
  );

  return (
    <div className="PicturePicker">
      <input
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
        Drop an image here, or click on this box.
        <br />
        {imageUrl && (
          <img
            className="PicturePicker--image"
            src={imageUrl}
            alt="Upload preview"
          />
        )}
      </label>
    </div>
  );
};

export default PicturePicker;

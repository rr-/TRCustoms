import styles from "./index.module.css";
import { useState } from "react";
import { FileUploader } from "src/components/common/FileUploader";
import { applyStyle } from "src/components/markdown-composer/MarkdownStyle";
import type { UploadedFile } from "src/services/FileService";
import { UploadType } from "src/services/FileService";
import { extractErrorMessage } from "src/utils/misc";

interface MarkdownAttachmentStripProps {
  textarea: HTMLTextAreaElement | null;
}

const MarkdownAttachmentStrip = ({
  textarea,
}: MarkdownAttachmentStripProps) => {
  const [percentCompleted, setPercentCompleted] = useState<number | null>(null);

  const handleUploadFinish = (uploadedFiles: UploadedFile[]) => {
    if (!textarea) {
      return;
    }
    const isImage = uploadedFiles[0].url.match(/\.(jpg|png|gif)$/i);
    applyStyle(
      textarea,
      isImage
        ? {
            prefix: "![",
            suffix: `](${uploadedFiles[0].url})`,
          }
        : {
            prefix: "[",
            suffix: `download](${uploadedFiles[0].url})`,
            replaceNext: "download",
          },
    );
  };

  const handleUploadError = (error: unknown) => {
    const message = extractErrorMessage(error);
    if (message) {
      alert(message);
    }
  };

  const handleUploadPercentChange = (percent: number | null) => {
    setPercentCompleted(percent);
  };

  return (
    <div className={styles.wrapper}>
      <FileUploader
        allowMultiple={false}
        disableProgressbar={true}
        uploadType={UploadType.Attachment}
        onUploadFinish={handleUploadFinish}
        onUploadError={handleUploadError}
        onUploadPercentChange={handleUploadPercentChange}
        label={
          percentCompleted ? (
            <>
              <span
                className={styles.progressIndicator}
                style={{ width: `${percentCompleted}%` }}
              />
              <span className={styles.label}>
                Uploading…{" "}
                {`${Math.round(percentCompleted * 100) / 100}% complete`}
              </span>
            </>
          ) : (
            <span>
              Embed an image or attach .zip files by clicking on this box.
            </span>
          )
        }
      />
    </div>
  );
};

export { MarkdownAttachmentStrip };

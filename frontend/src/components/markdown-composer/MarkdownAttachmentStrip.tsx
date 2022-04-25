import "./MarkdownAttachmentStrip.css";
import { useState } from "react";
import { FileUploader } from "src/components/FileUploader";
import { applyStyle } from "src/components/markdown-composer/MarkdownStyle";
import type { UploadedFile } from "src/services/FileService";
import { UploadType } from "src/services/FileService";
import { extractErrorMessage } from "src/utils/misc";

interface MarkdownAttachmentStripProps {
  textarea: HTMLTextAreaElement;
}

const MarkdownAttachmentStrip = ({
  textarea,
}: MarkdownAttachmentStripProps) => {
  const [percentCompleted, setPercentCompleted] = useState<number | null>(null);
  const handleUploadFinish = (uploadedFiles: UploadedFile[]) => {
    applyStyle(textarea, {
      prefix: "![",
      suffix: `](${uploadedFiles[0].url})`,
    });
  };

  const handleUploadError = (error: Error | null) => {
    const message = extractErrorMessage(error);
    if (message) {
      alert(message);
    }
  };

  const handleUploadPercentChange = (percent: number | null) => {
    setPercentCompleted(percent);
  };

  return (
    <div className="MarkdownAttachmentStrip">
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
                className="MarkdownAttachmentStrip--progressIndicator"
                style={{ width: `${percentCompleted}%` }}
              />
              <span className="MarkdownAttachmentStrip--label">
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

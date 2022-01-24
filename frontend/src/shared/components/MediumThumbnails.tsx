import "./MediumThumbnails.css";
import type { UploadedFile } from "src/services/file.service";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";
import { DisplayMode } from "src/shared/types";

interface MediumThumbnailsProps {
  files: UploadedFile[];
  links: string[];
  displayMode: DisplayMode;
}

const MediumThumbnails = ({
  files,
  links,
  displayMode,
}: MediumThumbnailsProps) => {
  return (
    <div className="MediumThumbnails">
      {links.map((link) => (
        <MediumThumbnail displayMode={displayMode} key={link} link={link} />
      ))}
      {files.map((file) => (
        <MediumThumbnail displayMode={displayMode} key={file.id} file={file} />
      ))}
    </div>
  );
};

export { MediumThumbnails };

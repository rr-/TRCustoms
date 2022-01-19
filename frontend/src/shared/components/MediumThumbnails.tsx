import "./MediumThumbnails.css";
import type { UploadedFile } from "src/services/file.service";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";

interface MediumThumbnailsProps {
  files: UploadedFile[];
  links: string[];
}

const MediumThumbnails = ({ files, links }: MediumThumbnailsProps) => {
  return (
    <div className="MediumThumbnails">
      {links.map((link) => (
        <MediumThumbnail key={link} link={link} />
      ))}
      {files.map((file) => (
        <MediumThumbnail key={file.id} file={file} />
      ))}
    </div>
  );
};

export { MediumThumbnails };

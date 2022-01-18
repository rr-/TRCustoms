import "./MediumThumbnails.css";
import type { UploadedFile } from "src/services/file.service";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";

interface Medium {
  file: UploadedFile;
}

interface MediumThumbnailsProps {
  media: Medium[];
}

const MediumThumbnails = ({ media }: MediumThumbnailsProps) => {
  return (
    <div className="MediumThumbnails">
      {media.map((medium) => (
        <MediumThumbnail key={medium.file.id} file={medium.file} />
      ))}
    </div>
  );
};

export { MediumThumbnails };

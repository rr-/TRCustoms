import "./MediumThumbnails.css";
import type { MediumList } from "src/services/level.service";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";

interface MediumThumbnailsProps {
  media: MediumList;
}

const MediumThumbnails = ({ media }: MediumThumbnailsProps) => {
  return (
    <div className="MediumThumbnails">
      {media.map((medium) => (
        <MediumThumbnail key={medium.id} medium={medium} />
      ))}
    </div>
  );
};

export { MediumThumbnails };

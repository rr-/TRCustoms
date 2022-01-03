import { fetchMultipart } from "src/shared/client";
import { API_URL } from "src/shared/constants";

enum UploadType {
  UserPicture = "up",
  LevelBanner = "lb",
  LevelScreenshot = "ls",
  LevelFile = "lf",
}

interface UploadedFile {
  id: number;
  content: string; // URL
  upload_type: UploadType;
}

const uploadFile = async (
  file: File,
  type: UploadType
): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append("content", file);
  formData.append("upload_type", type);
  return await fetchMultipart(`${API_URL}/uploads/`, {
    method: "POST",
    data: formData,
  });
};

const FileService = {
  uploadFile,
};

export { UploadType, FileService };

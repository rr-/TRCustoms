import { fetchJSON } from "src/shared/client";
import { fetchMultipart } from "src/shared/client";
import { API_URL } from "src/shared/constants";

enum UploadType {
  UserPicture = "up",
  LevelCover = "lb",
  LevelScreenshot = "ls",
  LevelFile = "lf",
}

interface UploadedFile {
  id: number;
  url: string;
  upload_type: UploadType;
}

const getFileById = async (fileId: number): Promise<UploadedFile | null> => {
  return await fetchJSON<UploadedFile>(`${API_URL}/uploads/${fileId}/`, {
    method: "GET",
  });
};

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
  getFileById,
  uploadFile,
};

export type { UploadedFile };
export { UploadType, FileService };

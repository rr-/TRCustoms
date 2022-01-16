import { AxiosResponse } from "axios";
import { api } from "src/shared/api";
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

const getFileById = async (fileId: number): Promise<UploadedFile> => {
  const response = (await api.get(
    `${API_URL}/uploads/${fileId}/`
  )) as AxiosResponse<UploadedFile>;
  return response.data;
};

const uploadFile = async (
  file: File,
  type: UploadType
): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append("content", file);
  formData.append("upload_type", type);
  const response = (await api.post(
    `${API_URL}/uploads/`,
    formData
  )) as AxiosResponse<UploadedFile>;
  return response.data;
};

const FileService = {
  getFileById,
  uploadFile,
};

export type { UploadedFile };
export { UploadType, FileService };

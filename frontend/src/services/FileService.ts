import { AxiosResponse } from "axios";
import { api } from "src/api";
import { uploadsRetrieve } from "src/client";
import type { UploadedFileNested as UploadedFile } from "src/client";
import { API_URL } from "src/constants";

enum UploadType {
  UserPicture = "up",
  LevelCover = "lb",
  LevelScreenshot = "ls",
  LevelFile = "lf",
  Attachment = "at",
}

const getFileById = async (fileId: number): Promise<UploadedFile> => {
  const { data } = await uploadsRetrieve({
    path: { id: `${fileId}` },
    throwOnError: true,
  });
  return data;
};

// Uploads stay on axios because they report upload progress, which the
// fetch-based generated client cannot do.
const uploadFile = async (
  file: File,
  type: UploadType,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append("content", file);
  formData.append("upload_type", type);
  const response = (await api.post(`${API_URL}/uploads/`, formData, {
    onUploadProgress,
  })) as AxiosResponse<UploadedFile>;
  return response.data;
};

const FileService = {
  getFileById,
  uploadFile,
};

export type { UploadedFile };
export { UploadType, FileService };

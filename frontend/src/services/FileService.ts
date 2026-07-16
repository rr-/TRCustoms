import { uploadsRetrieve } from "src/client";
import type { UploadedFileNested as UploadedFile } from "src/client";
import { API_URL } from "src/constants";
import { AuthService } from "src/services/AuthService";

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

// Uploads use XMLHttpRequest so they can report upload progress, which the
// fetch-based generated client cannot do.
const uploadFile = (
  file: File,
  type: UploadType,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): Promise<UploadedFile> => {
  return new Promise<UploadedFile>((resolve, reject) => {
    const formData = new FormData();
    formData.append("content", file);
    formData.append("upload_type", type);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/uploads/`);
    const token = AuthService.getAccessToken();
    if (token) {
      xhr.setRequestHeader("X-Access-Token", `Bearer ${token}`);
    }
    if (onUploadProgress) {
      xhr.upload.onprogress = onUploadProgress;
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          reject(JSON.parse(xhr.responseText));
        } catch {
          reject(xhr.responseText);
        }
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
};

const FileService = {
  getFileById,
  uploadFile,
};

export type { UploadedFile };
export { UploadType, FileService };

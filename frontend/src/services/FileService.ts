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

// A failed upload response, carrying the status so the caller can decide to
// refresh-and-retry; body preserves the original parsed error for callers.
interface UploadFailure {
  status: number;
  body: unknown;
}

const isUploadFailure = (value: unknown): value is UploadFailure =>
  typeof value === "object" && value !== null && "status" in value;

// Uploads use XMLHttpRequest so they can report upload progress, which the
// fetch-based generated client cannot do.
const sendUpload = (
  file: File,
  type: UploadType,
  token: string | null,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): Promise<UploadedFile> => {
  return new Promise<UploadedFile>((resolve, reject) => {
    const formData = new FormData();
    formData.append("content", file);
    formData.append("upload_type", type);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/uploads/`);
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
        let body: unknown;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          body = xhr.responseText;
        }
        reject({ status: xhr.status, body } satisfies UploadFailure);
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
};

const uploadFile = async (
  file: File,
  type: UploadType,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): Promise<UploadedFile> => {
  try {
    return await sendUpload(
      file,
      type,
      AuthService.getAccessToken(),
      onUploadProgress,
    );
  } catch (failure) {
    // The XHR path bypasses authFetch, so refresh and retry once on a stale
    // access token, mirroring the fetch wrapper's behaviour.
    if (isUploadFailure(failure) && failure.status === 401) {
      const token = await AuthService.getNewAccessToken();
      return sendUpload(file, type, token, onUploadProgress).catch(
        (retryFailure) => {
          throw isUploadFailure(retryFailure)
            ? retryFailure.body
            : retryFailure;
        },
      );
    }
    // Preserve the original rejection shape (parsed body or network Error).
    throw isUploadFailure(failure) ? failure.body : failure;
  }
};

const FileService = {
  getFileById,
  uploadFile,
};

export type { UploadedFile };
export { UploadType, FileService };

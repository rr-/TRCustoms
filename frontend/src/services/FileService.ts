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

const SIGNATURES: Array<[number[], string]> = [
  [[0x50, 0x4b, 0x03, 0x04], "application/zip"],
  [[0x50, 0x4b, 0x05, 0x06], "application/zip"],
  [[0x50, 0x4b, 0x07, 0x08], "application/zip"],
  [[0x89, 0x50, 0x4e, 0x47], "image/png"],
  [[0xff, 0xd8, 0xff], "image/jpeg"],
];

const sniffContentType = async (file: File): Promise<string | null> => {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  for (const [signature, contentType] of SIGNATURES) {
    if (signature.every((byte, index) => head[index] === byte)) {
      return contentType;
    }
  }
  return null;
};

interface PresignedUpload {
  id: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  expires_in: number;
}

const parseBody = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// Uploads use XMLHttpRequest so they can report upload progress, which the
// fetch-based generated client cannot do.
const sendXhr = (
  method: string,
  url: string,
  body: XMLHttpRequestBodyInit,
  headers: Record<string, string>,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): Promise<unknown> => {
  return new Promise<unknown>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    for (const [name, value] of Object.entries(headers)) {
      xhr.setRequestHeader(name, value);
    }
    if (onUploadProgress) {
      xhr.upload.onprogress = onUploadProgress;
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(parseBody(xhr.responseText));
      } else {
        reject({
          status: xhr.status,
          body: parseBody(xhr.responseText),
        } satisfies UploadFailure);
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(body);
  });
};

const authHeaders = (token: string | null): Record<string, string> =>
  token ? { "X-Access-Token": `Bearer ${token}` } : {};

const sendDirectUpload = (
  file: File,
  type: UploadType,
  token: string | null,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append("content", file);
  formData.append("upload_type", type);
  return sendXhr(
    "POST",
    `${API_URL}/uploads/`,
    formData,
    authHeaders(token),
    onUploadProgress,
  ) as Promise<UploadedFile>;
};

const reserveUpload = async (
  file: File,
  type: UploadType,
  token: string | null,
): Promise<PresignedUpload | null> => {
  const contentType =
    (await sniffContentType(file)) || file.type || "application/octet-stream";

  const response = await fetch(`${API_URL}/uploads/presign/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({
      upload_type: type,
      content_type: contentType,
      size: file.size,
    }),
  });

  if (response.status === 409) {
    return null;
  }
  if (!response.ok) {
    throw {
      status: response.status,
      body: parseBody(await response.text()),
    } satisfies UploadFailure;
  }
  return response.json();
};

const sendPresignedUpload = async (
  file: File,
  reserved: PresignedUpload,
  token: string | null,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): Promise<UploadedFile> => {
  await sendXhr(
    reserved.method,
    reserved.url,
    file,
    reserved.headers,
    onUploadProgress,
  );

  const response = await fetch(`${API_URL}/uploads/${reserved.id}/confirm/`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw {
      status: response.status,
      body: parseBody(await response.text()),
    } satisfies UploadFailure;
  }
  return response.json();
};

const sendUpload = async (
  file: File,
  type: UploadType,
  token: string | null,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): Promise<UploadedFile> => {
  const reserved = await reserveUpload(file, type, token);
  if (!reserved) {
    return sendDirectUpload(file, type, token, onUploadProgress);
  }
  return sendPresignedUpload(file, reserved, token, onUploadProgress);
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

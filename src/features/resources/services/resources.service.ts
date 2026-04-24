import { api } from "@/lib/api";
import type { Resource } from "@/types";
import type { ResourceInput } from "../schemas/resource.schema";

export interface ResourceUploadSessionRequest {
  file_name: string;
  mime_type: string;
  title: string;
  resource_type: "MAIN" | "SECONDARY";
  resource_format: "VIDEO" | "PDF" | "DOCUMENT" | "LINK" | "IMAGE";
  order_index: number;
}

export interface ResourceUploadSessionResponse {
  upload_url: string;
  resource_id: string;
}

export interface ConfirmResourceUploadRequest {
  resource_id: string;
  drive_file_id: string;
}

export const resourcesService = {
  async getAll(lessonId: string): Promise<Resource[]> {
    const res = await api.get<Resource[]>(`/lessons/${lessonId}/resources/`);
    return res.data;
  },

  async getById(lessonId: string, id: string): Promise<Resource> {
    const res = await api.get<Resource>(`/lessons/${lessonId}/resources/${id}`);
    return res.data;
  },

  async create(lessonId: string, data: ResourceInput): Promise<Resource> {
    const res = await api.post<Resource>(`/lessons/${lessonId}/resources/`, data);
    return res.data;
  },

  async update(
    lessonId: string,
    id: string,
    data: Partial<ResourceInput>,
  ): Promise<Resource> {
    const res = await api.put<Resource>(`/lessons/${lessonId}/resources/${id}`, data);
    return res.data;
  },

  async delete(lessonId: string, id: string): Promise<void> {
    await api.delete(`/lessons/${lessonId}/resources/${id}`);
  },

  // ── Direct upload (≤ 100 MB) ──────────────────────────────────────────────
  async uploadDirect(
    lessonId: string,
    formData: FormData,
    onProgress?: (pct: number) => void,
  ): Promise<Resource> {
    const res = await api.post<Resource>(
      `/lessons/${lessonId}/resources/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      },
    );
    return res.data;
  },

  // ── Resumable session upload (> 100 MB) ───────────────────────────────────
  async requestUploadSession(
    lessonId: string,
    data: ResourceUploadSessionRequest,
  ): Promise<ResourceUploadSessionResponse> {
    const res = await api.post<ResourceUploadSessionResponse>(
      `/lessons/${lessonId}/resources/upload-session`,
      data,
    );
    return res.data;
  },

  // ── Upload bytes directly to Drive resumable URL ──────────────────────────
  async putFileToDrive(
    uploadUrl: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      if (onProgress) {
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) onProgress(Math.round((evt.loaded * 100) / evt.total));
        };
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            resolve(json.id as string);
          } catch {
            reject(new Error("Drive upload response could not be parsed"));
          }
        } else {
          reject(new Error(`Drive upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error("Drive upload network error"));
      xhr.send(file);
    });
  },

  // ── Confirm upload after bytes are sent to Drive ──────────────────────────
  async confirmUpload(
    lessonId: string,
    data: ConfirmResourceUploadRequest,
  ): Promise<Resource> {
    const res = await api.post<Resource>(
      `/lessons/${lessonId}/resources/confirm-upload`,
      data,
    );
    return res.data;
  },
};

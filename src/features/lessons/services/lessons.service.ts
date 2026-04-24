import { api } from "@/lib/api";
import type { Lesson } from "@/types";
import type { LessonInput } from "../schemas/lesson.schema";

export interface UploadSessionRequest {
  file_name: string;
  mime_type: string;
  title: string;
  order_index: number;
}

export interface UploadSessionResponse {
  upload_url: string;
  lesson_folder_id: string;
}

export interface ConfirmUploadRequest {
  drive_file_id: string;
  lesson_folder_id: string;
  title: string;
  lesson_type: "VIDEO" | "PDF" | "TEXT";
  duration_minutes: number;
  order_index: number;
}

export const lessonsService = {
  async getAll(moduleId: string): Promise<Lesson[]> {
    const res = await api.get<Lesson[]>(`/modules/${moduleId}/lessons/`);
    console.log(`[lessonsService.getAll] moduleId=${moduleId}`, res.data);
    return res.data;
  },

  async getById(moduleId: string, id: string): Promise<Lesson> {
    const res = await api.get<Lesson>(`/modules/${moduleId}/lessons/${id}`);
    console.log(`[lessonsService.getById] moduleId=${moduleId} id=${id}`, res.data);
    return res.data;
  },

  async create(moduleId: string, data: Omit<LessonInput, "module_id">): Promise<Lesson> {
    const res = await api.post<Lesson>(`/modules/${moduleId}/lessons/`, data);
    console.log(`[lessonsService.create] moduleId=${moduleId}`, res.data);
    return res.data;
  },

  async update(moduleId: string, id: string, data: Partial<Omit<LessonInput, "module_id">>): Promise<Lesson> {
    const res = await api.put<Lesson>(`/modules/${moduleId}/lessons/${id}`, data);
    return res.data;
  },

  async delete(moduleId: string, id: string): Promise<void> {
    await api.delete(`/modules/${moduleId}/lessons/${id}`);
  },

  // ── File upload (direct — ≤ 100 MB) ──────────────────────────────────────
  async uploadDirect(
    moduleId: string,
    formData: FormData,
    onProgress?: (pct: number) => void,
  ): Promise<Lesson> {
    const res = await api.post<Lesson>(
      `/modules/${moduleId}/lessons/upload`,
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

  // ── File upload (resumable session — > 100 MB) ────────────────────────────
  async requestUploadSession(
    moduleId: string,
    data: UploadSessionRequest,
  ): Promise<UploadSessionResponse> {
    const res = await api.post<UploadSessionResponse>(
      `/modules/${moduleId}/lessons/upload-session`,
      data,
    );
    return res.data;
  },

  // ── Upload file bytes directly to Drive resumable URL ─────────────────────
  async putFileToDrive(
    uploadUrl: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    // Raw fetch — avoids our axios base URL/auth interceptors
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

  // ── Confirm upload after sending bytes to Drive ───────────────────────────
  async confirmUpload(moduleId: string, data: ConfirmUploadRequest): Promise<Lesson> {
    const res = await api.post<Lesson>(
      `/modules/${moduleId}/lessons/confirm-upload`,
      data,
    );
    return res.data;
  },
};



import { api } from "@/lib/api";
import type { DriveFile } from "@/types";

export const filesService = {
  async getAll(): Promise<DriveFile[]> {
    const res = await api.get<DriveFile[]>("/storage/files");
    return res.data;
  },

  async upload(
    file: File,
    folderId?: string,
    onProgress?: (percent: number) => void,
  ): Promise<DriveFile> {
    const form = new FormData();
    form.append("file", file);
    if (folderId) form.append("folder_id", folderId);
    const res = await api.post<DriveFile>("/storage/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
      onUploadProgress(evt) {
        if (evt.total && evt.total > 0) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          onProgress?.(percent);
        }
      },
    });
    return res.data;
  },

  async delete(fileId: string): Promise<void> {
    await api.delete(`/storage/files/${fileId}`);
  },
};

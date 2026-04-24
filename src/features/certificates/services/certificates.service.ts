import { api } from "@/lib/api";
import type { Certificate } from "@/types";

export const certificatesService = {
  async getAll(skip = 0, limit = 50): Promise<Certificate[]> {
    const res = await api.get<Certificate[]>("/certificates/", { params: { skip, limit } });
    return res.data;
  },

  async getById(id: string): Promise<Certificate> {
    const res = await api.get<Certificate>(`/certificates/${id}`);
    return res.data;
  },

  async create(data: Partial<Certificate>): Promise<Certificate> {
    const res = await api.post<Certificate>("/certificates/", data);
    return res.data;
  },

  async update(id: string, data: Partial<Certificate>): Promise<Certificate> {
    const res = await api.patch<Certificate>(`/certificates/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/certificates/${id}`);
  },

  async getMyCertificates(): Promise<Certificate[]> {
    const res = await api.get<Certificate[]>("/certificates/my");
    return res.data;
  },

  async verify(code: string): Promise<Certificate> {
    const res = await api.get<Certificate>(`/certificates/verify/${code}`);
    return res.data;
  },

  async uploadPdf(id: string, file: File): Promise<Certificate> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<Certificate>(
      `/certificates/${id}/upload-pdf`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },
};

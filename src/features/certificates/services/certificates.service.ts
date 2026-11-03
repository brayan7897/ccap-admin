import { api } from "@/lib/api";
import type { Certificate } from "@/types";
import { readTotal, type Page } from "@/lib/pagination";

export interface CertificateListParams {
  skip?: number;
  limit?: number;
  /** Free text: student name, DNI, email, course title or certificate code. */
  q?: string;
  course_id?: string;
  user_id?: string;
}

export const certificatesService = {
  /** Server-side paginated + filtered list (names come resolved from the API). */
  async list({ skip = 0, limit = 25, q, course_id, user_id }: CertificateListParams = {}): Promise<Page<Certificate>> {
    const params = {
      skip,
      limit,
      ...(q && { q }),
      ...(course_id && { course_id }),
      ...(user_id && { user_id }),
    };
    const res = await api.get<Certificate[]>("/certificates/", { params });
    return { items: res.data, total: readTotal(res.headers, skip, res.data.length) };
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

  async verify(code: string): Promise<Certificate[]> {
    const res = await api.get<Certificate[]>(`/certificates/verify/${code}`);
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

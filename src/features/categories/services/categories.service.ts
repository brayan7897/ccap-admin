import { api } from "@/lib/api";
import type { CategoryResponse, CategoryInput } from "../schemas/category.schema";

export const categoriesService = {
  async getAll(): Promise<CategoryResponse[]> {
    const res = await api.get<CategoryResponse[]>("/categories/");
    return res.data;
  },

  async getById(id: string): Promise<CategoryResponse> {
    const res = await api.get<CategoryResponse>(`/categories/${id}`);
    return res.data;
  },

  async create(data: CategoryInput): Promise<CategoryResponse> {
    const res = await api.post<CategoryResponse>("/categories/", data);
    return res.data;
  },

  async update(id: string, data: Partial<CategoryInput>): Promise<CategoryResponse> {
    const res = await api.put<CategoryResponse>(`/categories/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

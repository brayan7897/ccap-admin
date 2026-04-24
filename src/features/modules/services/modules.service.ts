import { api } from "@/lib/api";
import type { Module } from "@/types";
import type { ModuleInput } from "../schemas/module.schema";

export const modulesService = {
  async getAll(courseId: string): Promise<Module[]> {
    const res = await api.get<Module[]>(`/courses/${courseId}/modules/`);
    return res.data;
  },

  async getById(courseId: string, id: string): Promise<Module> {
    const res = await api.get<Module>(`/courses/${courseId}/modules/${id}`);
    return res.data;
  },

  async create(courseId: string, data: Omit<ModuleInput, "course_id">): Promise<Module> {
    const res = await api.post<Module>(`/courses/${courseId}/modules/`, data);
    return res.data;
  },

  async update(courseId: string, id: string, data: Partial<Omit<ModuleInput, "course_id">>): Promise<Module> {
    const res = await api.put<Module>(`/courses/${courseId}/modules/${id}`, data);
    return res.data;
  },

  async delete(courseId: string, id: string): Promise<void> {
    await api.delete(`/courses/${courseId}/modules/${id}`);
  },
};


"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CategoryInput } from "../schemas/category.schema";
import { categoriesService } from "../services/categories.service";

const QUERY_KEY = ["categories"] as const;

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => categoriesService.getAll(),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => categoriesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) => categoriesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Categoría creada correctamente.");
    },
    onError: () => toast.error("Error al crear la categoría."),
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CategoryInput>) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Categoría actualizada.");
    },
    onError: () => toast.error("Error al actualizar la categoría."),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Categoría eliminada.");
    },
    onError: () => toast.error("Error al eliminar la categoría."),
  });
}

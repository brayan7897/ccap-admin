"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LessonInput } from "../schemas/lesson.schema";
import { lessonsService } from "../services/lessons.service";

const QUERY_KEY = ["lessons"] as const;

export function useLessons(moduleId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, { moduleId }],
    queryFn: () => lessonsService.getAll(moduleId),
    enabled: !!moduleId,
  });
}

export function useLesson(moduleId: string, id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, moduleId, id],
    queryFn: () => lessonsService.getById(moduleId, id),
    enabled: !!moduleId && !!id,
  });
}

export function useCreateLesson(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<LessonInput, "module_id">) =>
      lessonsService.create(moduleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { moduleId }] });
      toast.success("Lección creada correctamente.");
    },
    onError: () => toast.error("Error al crear la lección."),
  });
}

export function useUpdateLesson(moduleId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<LessonInput, "module_id">>) =>
      lessonsService.update(moduleId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { moduleId }] });
      toast.success("Lección actualizada.");
    },
    onError: () => toast.error("Error al actualizar la lección."),
  });
}

export function useDeleteLesson(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonsService.delete(moduleId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { moduleId }] });
      toast.success("Lección eliminada.");
    },
    onError: () => toast.error("Error al eliminar la lección."),
  });
}

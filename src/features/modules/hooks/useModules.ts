"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ModuleInput } from "../schemas/module.schema";
import { modulesService } from "../services/modules.service";

const QUERY_KEY = ["modules"] as const;

export function useModules(courseId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, { courseId }],
    queryFn: () => modulesService.getAll(courseId),
    enabled: !!courseId,
  });
}

export function useModule(courseId: string, id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, courseId, id],
    queryFn: () => modulesService.getById(courseId, id),
    enabled: !!courseId && !!id,
  });
}

export function useCreateModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ModuleInput, "course_id">) =>
      modulesService.create(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { courseId }] });
      toast.success("Módulo creado correctamente.");
    },
    onError: () => toast.error("Error al crear el módulo."),
  });
}

export function useUpdateModule(courseId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<ModuleInput, "course_id">>) =>
      modulesService.update(courseId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { courseId }] });
      toast.success("Módulo actualizado.");
    },
    onError: () => toast.error("Error al actualizar el módulo."),
  });
}

export function useDeleteModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modulesService.delete(courseId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { courseId }] });
      toast.success("Módulo eliminado.");
    },
    onError: () => toast.error("Error al eliminar el módulo."),
  });
}

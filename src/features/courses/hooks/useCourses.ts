"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CourseInput } from "../schemas/course.schema";
import { coursesService } from "../services/courses.service";
import { useDataStore } from "@/store/data-store";

const QUERY_KEY = ["courses"] as const;
const CATALOG_KEY = ["catalog", "courses"] as const;

export function useCourses(
  skip = 0,
  limit = 50,
  q?: string,
  sort_by?: string,
  sort_order?: "asc" | "desc"
) {
  return useQuery({
    queryKey: [...QUERY_KEY, { skip, limit, q, sort_by, sort_order }],
    queryFn: () => coursesService.getAll(skip, limit, q, sort_by, sort_order),
    staleTime: 3 * 60 * 1000, // 3 min — course lists change infrequently
    placeholderData: keepPreviousData,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => coursesService.getById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 min
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseInput) => coursesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });

      useDataStore.getState().invalidateEnrollmentStats();
      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Curso creado correctamente.");
    },
    onError: () => {
      toast.error("Error al crear el curso.");
    },
  });
}

export function useUpdateCourse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CourseInput>) =>
      coursesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });

      useDataStore.getState().invalidateEnrollmentStats();
      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Curso actualizado correctamente.");
    },
    onError: () => {
      toast.error("Error al actualizar el curso.");
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });

      useDataStore.getState().invalidateEnrollmentStats();
      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Curso eliminado.");
    },
    onError: () => {
      toast.error("Error al eliminar el curso.");
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CourseInput } from "../schemas/course.schema";
import { coursesService, type CourseListParams } from "../services/courses.service";
import { useDataStore } from "@/store/data-store";

const QUERY_KEY = ["courses"] as const;
const CATALOG_KEY = ["catalog", "courses"] as const;

export function useCoursesList(params: CourseListParams) {
  return useQuery({
    queryKey: [...QUERY_KEY, "list", params],
    queryFn: () => coursesService.list(params),
    staleTime: 60 * 1000,
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

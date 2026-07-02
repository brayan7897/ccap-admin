"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { enrollmentsService } from "../services/enrollments.service";
import { useDataStore } from "@/store/data-store";

const QUERY_KEY = ["enrollments"] as const;

// ── Admin: all enrollments ────────────────────────────────────────────────────
export function useEnrollments(skip = 0, limit = 50) {
  return useQuery({
    queryKey: [...QUERY_KEY, { skip, limit }],
    queryFn: () => enrollmentsService.getAll(skip, limit),
    staleTime: 3 * 60 * 1000, // 3 min — enrollment lists don't change every second
  });
}

// ── ActiveUser: own enrollments ───────────────────────────────────────────────
export function useMyEnrollments() {
  return useQuery({
    queryKey: [...QUERY_KEY, "me"],
    queryFn: () => enrollmentsService.getMyEnrollments(),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

/**
 * Carga agregada de matrículas para estadísticas.
 * Trae hasta 1 000 registros una sola vez y popula el data-store con el mapa
 * { course_id → enrolled_count }. El store evita re-cálculos en cada render
 * y comparte el resultado entre todos los paneles que lo consuman.
 */
export function useEnrollmentStats() {
  const { enrollmentStatsLoaded, setEnrollmentsData } = useDataStore();

  const query = useQuery({
    queryKey: [...QUERY_KEY, "stats"],
    queryFn: () => enrollmentsService.getAll(0, 1000),
    // Solo se ejecuta si el store todavía no tiene datos
    enabled: !enrollmentStatsLoaded,
    staleTime: 5 * 60 * 1000, // 5 min — no re-fetch innecesarios
  });

  useEffect(() => {
    if (!query.data) return;
    const map = query.data.reduce<Record<string, number>>((acc, e) => {
      acc[e.course_id] = (acc[e.course_id] ?? 0) + 1;
      return acc;
    }, {});
    setEnrollmentsData(query.data, map);
  }, [query.data, setEnrollmentsData]);

  return query;
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (course_id: string) => enrollmentsService.enroll(course_id),
    onSuccess: (_, course_id) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      // Optimistic update: increment the count for this course in-memory.
      // This avoids discarding and re-fetching 1,000 enrollment records.
      useDataStore.getState().incrementEnrolledCount(course_id);
      toast.success("Inscripción realizada.");
    },
    onError: () => toast.error("Error al inscribirse en el curso."),
  });
}

export function useCancelEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enrollmentsService.cancel(id),
    onSuccess: (cancelledEnrollment) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      // Optimistic update: decrement count for this course in-memory.
      // Avoids discarding the entire 1,000-record enrollment stats cache.
      useDataStore.getState().decrementEnrolledCount(cancelledEnrollment.course_id);
      toast.success("Inscripción cancelada.");
    },
    onError: () => toast.error("Error al cancelar la inscripción."),
  });
}

export function useAdminEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      user_id,
      course_id,
    }: {
      user_id: string;
      course_id: string;
    }) => enrollmentsService.adminEnroll(user_id, course_id),
    onSuccess: (_, { course_id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      // Optimistic update: no full stats re-fetch needed.
      useDataStore.getState().incrementEnrolledCount(course_id);
      toast.success("Usuario matriculado correctamente.");
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      if (detail === "User is already enrolled in this course") {
        toast.error("El usuario ya está matriculado en ese curso.");
      } else {
        toast.error("Error al matricular al usuario.");
      }
    },
  });
}

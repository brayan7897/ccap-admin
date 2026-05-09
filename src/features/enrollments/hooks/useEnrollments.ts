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
  });
}

// ── ActiveUser: own enrollments ───────────────────────────────────────────────
export function useMyEnrollments() {
  return useQuery({
    queryKey: [...QUERY_KEY, "me"],
    queryFn: () => enrollmentsService.getMyEnrollments(),
  });
}

/**
 * Carga agregada de matrículas para estadísticas.
 * Trae hasta 1 000 registros una sola vez y popula el data-store con el mapa
 * { course_id → enrolled_count }. El store evita re-cálculos en cada render
 * y comparte el resultado entre todos los paneles que lo consuman.
 */
export function useEnrollmentStats() {
  const { enrollmentStatsLoaded, setEnrolledCountMap } = useDataStore();

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
    setEnrolledCountMap(map);
  }, [query.data, setEnrolledCountMap]);

  return query;
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (course_id: string) => enrollmentsService.enroll(course_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      useDataStore.getState().invalidateEnrollmentStats();
      toast.success("Inscripción realizada.");
    },
    onError: () => toast.error("Error al inscribirse en el curso."),
  });
}

export function useCancelEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enrollmentsService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      useDataStore.getState().invalidateEnrollmentStats();
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      useDataStore.getState().invalidateEnrollmentStats();
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

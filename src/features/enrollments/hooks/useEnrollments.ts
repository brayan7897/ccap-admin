"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { enrollmentsService, type EnrollmentListParams } from "../services/enrollments.service";
import { useDataStore } from "@/store/data-store";

const QUERY_KEY = ["enrollments"] as const;

// ── Admin: all enrollments ────────────────────────────────────────────────────
export function useEnrollmentsList(params: EnrollmentListParams) {
  return useQuery({
    queryKey: [...QUERY_KEY, "list", params],
    queryFn: () => enrollmentsService.list(params),
    staleTime: 30 * 1000,
    // Keep the previous page on screen while the next one loads (no flicker).
    placeholderData: keepPreviousData,
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

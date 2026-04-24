"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { enrollmentsService } from "../services/enrollments.service";

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

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (course_id: string) => enrollmentsService.enroll(course_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
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

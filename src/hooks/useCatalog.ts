"use client";

/**
 * Catalog hooks — load reference data (users, courses) once per session.
 * All panels that need lookup maps (name by ID, etc.) should use these hooks
 * instead of calling useUsers / useCourses directly with large limits.
 *
 * Invalidation is handled by the mutation hooks using qc.invalidateQueries.
 */
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/features/users/services/users.service";
import { coursesService } from "@/features/courses/services/courses.service";

// ── Users catalog ─────────────────────────────────────────────────────────────

export function useUsersCatalog() {
  const { data, isLoading } = useQuery({
    queryKey: ["catalog", "users"],
    queryFn: () => usersService.getAll(0, 1000), // Increased to 1000 to cover all typical names for lookup maps
    staleTime: Infinity,
  });

  return {
    users: data ?? [],
    isLoading,
  };
}

// ── Courses catalog ───────────────────────────────────────────────────────────

export function useCoursesCatalog() {
  const { data, isLoading } = useQuery({
    queryKey: ["catalog", "courses"],
    queryFn: () => coursesService.getAll(0, 1000), // Increased to 1000 to cover all typical names for lookup maps
    staleTime: Infinity,
  });

  return {
    courses: data ?? [],
    isLoading,
  };
}

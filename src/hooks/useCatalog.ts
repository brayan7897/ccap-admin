"use client";

/**
 * Catalog hooks — load reference data (users, courses) once per session.
 * All panels that need lookup maps (name by ID, etc.) should use these hooks
 * instead of calling useUsers / useCourses directly with large limits.
 *
 * Invalidation is handled by the mutation hooks using qc.invalidateQueries.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/features/users/services/users.service";
import { coursesService } from "@/features/courses/services/courses.service";
import { rolesService } from "@/features/roles/services/roles.service";

// ── Users catalog ─────────────────────────────────────────────────────────────

export function useUsersCatalog() {
  const { data, isLoading } = useQuery({
    queryKey: ["catalog", "users"],
    queryFn: () => usersService.getAll(0, 50),
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
    queryFn: () => coursesService.getAll(0, 50),
    staleTime: Infinity,
  });

  return {
    courses: data ?? [],
    isLoading,
  };
}

// ── Instructors catalog (server-side role filter) ─────────────────────────────

export function useInstructorsCatalog() {
  const { data: roles } = useQuery({
    queryKey: ["catalog", "roles"],
    queryFn: () => rolesService.getAll(),
    staleTime: Infinity,
  });

  const instructorRoleId = useMemo(
    () =>
      roles?.find(
        (r) =>
          r.name?.toLowerCase().includes("instructor") ||
          r.name?.toLowerCase().includes("profesor")
      )?.id,
    [roles]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["catalog", "users", "instructors", instructorRoleId],
    queryFn: () => usersService.getAll(0, 50, undefined, undefined, undefined, undefined, instructorRoleId),
    enabled: !!instructorRoleId,
    staleTime: Infinity,
  });

  return {
    users: data ?? [],
    isLoading: isLoading || !instructorRoleId,
  };
}

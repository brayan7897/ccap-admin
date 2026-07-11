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
import { useDebounce } from "@/hooks/useDebounce";

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

// ── Users live search (beyond the first 50 in the catalog above) ──────────────
// Used by UserCombobox once the admin has typed enough characters — the plain
// catalog above only ever holds the first 50 users, so anyone past that cap
// (or created after the catalog first loaded) is otherwise unreachable.

export function useUsersSearch(query: string) {
  const debounced = useDebounce(query.trim(), 400);
  const enabled = debounced.length >= 3;

  const { data, isFetching } = useQuery({
    queryKey: ["catalog", "users", "search", debounced],
    queryFn: () => usersService.getAll(0, 20, undefined, debounced),
    enabled,
    staleTime: 30_000,
  });

  return {
    results: data ?? [],
    isSearching: enabled && isFetching,
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

// ── Courses live search (beyond the first 50 in the catalog above) ────────────
// Same rationale as useUsersSearch — CourseCombobox only ever client-filtered
// the frozen first-50 courses, making anything past that cap unreachable.

export function useCoursesSearch(query: string) {
  const debounced = useDebounce(query.trim(), 400);
  const enabled = debounced.length >= 3;

  const { data, isFetching } = useQuery({
    queryKey: ["catalog", "courses", "search", debounced],
    queryFn: () => coursesService.getAll(0, 20, debounced),
    enabled,
    staleTime: 30_000,
  });

  return {
    results: data ?? [],
    isSearching: enabled && isFetching,
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

// ── Instructors live search (server-side role filter + query) ─────────────────
// Used by CourseForm's instructor picker, which today uses a bare native
// <select> capped at the first 50 users with no search at all — the most
// severe instance of this bug, since there isn't even a typeahead fallback.

export function useInstructorsSearch(query: string, instructorRoleId: string | undefined) {
  const debounced = useDebounce(query.trim(), 400);
  const enabled = !!instructorRoleId && debounced.length >= 3;

  const { data, isFetching } = useQuery({
    queryKey: ["catalog", "users", "instructors", "search", instructorRoleId, debounced],
    queryFn: () =>
      usersService.getAll(0, 20, undefined, debounced, undefined, undefined, instructorRoleId),
    enabled,
    staleTime: 30_000,
  });

  return {
    results: data ?? [],
    isSearching: enabled && isFetching,
  };
}

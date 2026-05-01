"use client";

/**
 * Catalog hooks — load reference data (users, courses) once per session
 * and persist them in the Zustand data store. All panels that need lookup
 * maps (name by ID, etc.) should use these hooks instead of calling
 * useUsers / useCourses directly with large limits.
 *
 * Invalidation: call `useDataStore.getState().invalidateUsers()` (or courses)
 * from any mutation `onSuccess` to force a fresh catalog fetch on next access.
 */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDataStore } from "@/store/data-store";
import { usersService } from "@/features/users/services/users.service";
import { coursesService } from "@/features/courses/services/courses.service";

// ── Users catalog ─────────────────────────────────────────────────────────────

export function useUsersCatalog() {
  const { users, usersLoaded, setUsers } = useDataStore();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["catalog", "users"],
    queryFn: () => usersService.getAll(0, 50),
    enabled: !usersLoaded,
    staleTime: Infinity,
  });

  // Only write to the store once the fetch is fully settled, so we never lock
  // usersLoaded = true with a stale cached snapshot before the fresh response.
  useEffect(() => {
    if (data && !usersLoaded && !isFetching) {
      setUsers(data);
    }
  }, [data, usersLoaded, isFetching, setUsers]);

  return {
    users: usersLoaded ? users : (data ?? []),
    isLoading: !usersLoaded && isLoading,
  };
}

// ── Courses catalog ───────────────────────────────────────────────────────────

export function useCoursesCatalog() {
  const { courses, coursesLoaded, setCourses } = useDataStore();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["catalog", "courses"],
    queryFn: () => coursesService.getAll(0, 50),
    enabled: !coursesLoaded,
    staleTime: Infinity,
  });

  // Only write to the store once the fetch is fully settled.
  useEffect(() => {
    if (data && !coursesLoaded && !isFetching) {
      setCourses(data);
    }
  }, [data, coursesLoaded, isFetching, setCourses]);

  return {
    courses: coursesLoaded ? courses : (data ?? []),
    isLoading: !coursesLoaded && isLoading,
  };
}

"use client";

/**
 * Catalog hooks — load reference data (users, courses) once per session
 * and persist them in the Zustand data store. All panels that need lookup
 * maps (name by ID, etc.) should use these hooks instead of calling
 * useUsers / useCourses directly with large limits.
 */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDataStore } from "@/store/data-store";
import { usersService } from "@/features/users/services/users.service";
import { coursesService } from "@/features/courses/services/courses.service";

// ── Users catalog ─────────────────────────────────────────────────────────────

export function useUsersCatalog() {
  const { users, usersLoaded, setUsers } = useDataStore();

  const { data, isLoading } = useQuery({
    queryKey: ["catalog", "users"],
    queryFn: () => usersService.getAll(0, 50),
    enabled: !usersLoaded,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data && !usersLoaded) {
      setUsers(data);
    }
  }, [data, usersLoaded, setUsers]);

  return {
    users: usersLoaded ? users : (data ?? []),
    isLoading: !usersLoaded && isLoading,
  };
}

// ── Courses catalog ───────────────────────────────────────────────────────────

export function useCoursesCatalog() {
  const { courses, coursesLoaded, setCourses } = useDataStore();

  const { data, isLoading } = useQuery({
    queryKey: ["catalog", "courses"],
    queryFn: () => coursesService.getAll(0, 50),
    enabled: !coursesLoaded,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data && !coursesLoaded) {
      setCourses(data);
    }
  }, [data, coursesLoaded, setCourses]);

  return {
    courses: coursesLoaded ? courses : (data ?? []),
    isLoading: !coursesLoaded && isLoading,
  };
}

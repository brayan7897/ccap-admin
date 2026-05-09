/**
 * In-memory catalog store for reference data (users, courses).
 * Data is loaded once on first use and shared across all panels,
 * avoiding repeated API calls for the same catalog information.
 *
 * enrolledCountMap  — { [course_id]: number } built from the full enrollments list.
 * lessonCountMap    — { [course_id]: number } reserved for future lesson aggregation.
 */
import { create } from "zustand";
import type { User, Course } from "@/types";

interface DataState {
  users: User[];
  courses: Course[];
  usersLoaded: boolean;
  coursesLoaded: boolean;

  /** Derived stat maps — populated once by useEnrollmentStats */
  enrolledCountMap: Record<string, number>;
  enrollmentStatsLoaded: boolean;

  setUsers: (users: User[]) => void;
  setCourses: (courses: Course[]) => void;
  setEnrolledCountMap: (map: Record<string, number>) => void;

  /** Reset catalog (e.g. after a mutation that modifies the list) */
  invalidateUsers: () => void;
  invalidateCourses: () => void;
  invalidateEnrollmentStats: () => void;
}

export const useDataStore = create<DataState>()((set) => ({
  users: [],
  courses: [],
  usersLoaded: false,
  coursesLoaded: false,

  enrolledCountMap: {},
  enrollmentStatsLoaded: false,

  setUsers: (users) => set({ users, usersLoaded: true }),
  setCourses: (courses) => set({ courses, coursesLoaded: true }),
  setEnrolledCountMap: (map) =>
    set({ enrolledCountMap: map, enrollmentStatsLoaded: true }),

  invalidateUsers: () => set({ users: [], usersLoaded: false }),
  invalidateCourses: () => set({ courses: [], coursesLoaded: false }),
  invalidateEnrollmentStats: () =>
    set({ enrolledCountMap: {}, enrollmentStatsLoaded: false }),
}));

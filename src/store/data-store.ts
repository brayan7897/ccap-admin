/**
 * In-memory store for derived analytics data and specific UI-centric datasets.
 * Note: Reference catalogs (users, courses) are now strictly managed by
 * TanStack Query to prevent double-rendering and duplicated state.
 */
import { create } from "zustand";

interface DataState {
  /** Derived stat maps — populated once by useEnrollmentStats */
  enrollments: import("@/types").Enrollment[];
  enrolledCountMap: Record<string, number>;
  enrollmentStatsLoaded: boolean;

  setEnrollmentsData: (enrollments: import("@/types").Enrollment[], map: Record<string, number>) => void;

  /**
   * Granular optimistic update — increment count for a course without
   * discarding the whole cache and re-fetching 1,000 records.
   * Call this from mutation onSuccess when a new enrollment is created.
   */
  incrementEnrolledCount: (courseId: string) => void;

  /**
   * Granular optimistic update — decrement count for a course.
   * Call this from mutation onSuccess when an enrollment is cancelled/deleted.
   */
  decrementEnrolledCount: (courseId: string) => void;

  invalidateEnrollmentStats: () => void;
}

export const useDataStore = create<DataState>()((set) => ({
  enrollments: [],
  enrolledCountMap: {},
  enrollmentStatsLoaded: false,

  setEnrollmentsData: (enrollments, map) =>
    set({ enrollments, enrolledCountMap: map, enrollmentStatsLoaded: true }),

  // Optimistic increment — avoids a 1,000-record re-fetch on every enroll mutation
  incrementEnrolledCount: (courseId) =>
    set((s) => ({
      enrolledCountMap: {
        ...s.enrolledCountMap,
        [courseId]: (s.enrolledCountMap[courseId] ?? 0) + 1,
      },
    })),

  // Optimistic decrement — avoids a 1,000-record re-fetch on every cancel mutation
  decrementEnrolledCount: (courseId) =>
    set((s) => ({
      enrolledCountMap: {
        ...s.enrolledCountMap,
        [courseId]: Math.max(0, (s.enrolledCountMap[courseId] ?? 0) - 1),
      },
    })),

  invalidateEnrollmentStats: () =>
    set({ enrollments: [], enrolledCountMap: {}, enrollmentStatsLoaded: false }),
}));

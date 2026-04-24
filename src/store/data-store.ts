/**
 * In-memory catalog store for reference data (users, courses).
 * Data is loaded once on first use and shared across all panels,
 * avoiding repeated API calls for the same catalog information.
 */
import { create } from "zustand";
import type { User, Course } from "@/types";

interface DataState {
  users: User[];
  courses: Course[];
  usersLoaded: boolean;
  coursesLoaded: boolean;
  setUsers: (users: User[]) => void;
  setCourses: (courses: Course[]) => void;
  /** Reset catalog (e.g. after a mutation that modifies the list) */
  invalidateUsers: () => void;
  invalidateCourses: () => void;
}

export const useDataStore = create<DataState>()((set) => ({
  users: [],
  courses: [],
  usersLoaded: false,
  coursesLoaded: false,

  setUsers: (users) => set({ users, usersLoaded: true }),
  setCourses: (courses) => set({ courses, coursesLoaded: true }),

  invalidateUsers: () => set({ users: [], usersLoaded: false }),
  invalidateCourses: () => set({ courses: [], coursesLoaded: false }),
}));

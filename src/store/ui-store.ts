import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
}

function applyDarkClass(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setDarkMode: (value) => {
        applyDarkClass(value);
        set({ darkMode: value });
      },
      toggleDarkMode: () =>
        set((s) => {
          const next = !s.darkMode;
          applyDarkClass(next);
          return { darkMode: next };
        }),
    }),
    {
      name: "ccap-admin-ui",
      partialize: (s) => ({ darkMode: s.darkMode, sidebarOpen: s.sidebarOpen }),
      onRehydrateStorage: () => (state) => {
        if (state) applyDarkClass(state.darkMode);
      },
    },
  ),
);

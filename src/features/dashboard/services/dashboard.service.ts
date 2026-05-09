import { api } from "@/lib/api";

// ── Stats types ───────────────────────────────────────────────────────────────

export interface DashboardStatsResponse {
  users: {
    total: number;
    active: number;
    inactive: number;
    pending_course_access: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    avg_progress_pct: number;
  };
  lessons: {
    completed_events: number;
  };
}

// ── Chart types ───────────────────────────────────────────────────────────────

export interface MonthlyEnrollment {
  month: string;
  enrollments: number;
  completions: number;
}

export interface LevelDistribution {
  level: "BASIC" | "INTERMEDIATE" | "ADVANCED" | string;
  count: number;
}

export interface TopCourse {
  course_id: string;
  title: string;
  level: string;
  total_enrollments: number;
  completions: number;
  avg_progress_pct: number;
}

export interface EnrollmentStatusItem {
  status: string;
  count: number;
}

export interface CategoryItem {
  name: string;
  courses: number;
  enrollments: number;
}

export interface DashboardChartsResponse {
  monthly_enrollments: MonthlyEnrollment[];
  level_distribution: LevelDistribution[];
  top_courses: TopCourse[];
  enrollment_status: EnrollmentStatusItem[];
  categories: CategoryItem[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const dashboardService = {
  async getStats(): Promise<DashboardStatsResponse> {
    const res = await api.get<DashboardStatsResponse>("/admin/dashboard");
    return res.data;
  },

  async getChartsData(): Promise<DashboardChartsResponse> {
    const res = await api.get<DashboardChartsResponse>("/admin/dashboard/charts");
    return res.data;
  },
};

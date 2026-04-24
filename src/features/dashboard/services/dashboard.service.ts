import { api } from "@/lib/api";

export interface DashboardStatsResponse {
	users: {
		total: number;
		active: number;
		growth_pct: number;
	};
	courses: {
		total: number;
		published: number;
	};
	enrollments: {
		active: number;
		completed: number;
		avg_progress_pct: number;
	};
	lessons: {
		total_views: number;
		completed_events: number;
	};
}

export const dashboardService = {
	async getStats(): Promise<DashboardStatsResponse> {
		const res = await api.get<DashboardStatsResponse>("/admin/dashboard");
		return res.data;
	},
};

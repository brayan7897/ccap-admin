import { api } from "@/lib/api";
import type { Enrollment } from "@/types";

export const enrollmentsService = {
  async getAll(skip = 0, limit = 50, course_id?: string, user_id?: string): Promise<Enrollment[]> {
    const params = { skip, limit, ...(course_id && { course_id }), ...(user_id && { user_id }) };
    if (process.env.NODE_ENV === "development") {
      console.log("[enrollmentsService.getAll] params:", params);
    }

    const res = await api.get<Enrollment[]>("/enrollments/", {
      params,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[enrollmentsService.getAll] response:", res.data);
    }

    return res.data.map((enrollment: any) => ({
      ...enrollment,
      course_title: enrollment.course_title ?? enrollment.course_name ?? undefined,
      course_slug: enrollment.course_slug ?? undefined,
      course_type: enrollment.course_type ?? undefined,
      user_full_name: enrollment.user_full_name ?? enrollment.user_name ?? undefined,
      user_email: enrollment.user_email ?? undefined,
    }));
  },

  async getMyEnrollments(skip = 0, limit = 50): Promise<Enrollment[]> {
    const params = { skip, limit };
    if (process.env.NODE_ENV === "development") {
      console.log("[enrollmentsService.getMyEnrollments] params:", params);
    }

    const res = await api.get<Enrollment[]>("/enrollments/my", { params });

    if (process.env.NODE_ENV === "development") {
      console.log("[enrollmentsService.getMyEnrollments] response:", res.data);
    }

    return res.data.map((enrollment: any) => ({
      ...enrollment,
      course_title: enrollment.course_title ?? enrollment.course_name ?? undefined,
      course_slug: enrollment.course_slug ?? undefined,
      course_type: enrollment.course_type ?? undefined,
      user_full_name: enrollment.user_full_name ?? enrollment.user_name ?? undefined,
      user_email: enrollment.user_email ?? undefined,
    }));
  },

  async enroll(course_id: string): Promise<Enrollment> {
    const res = await api.post<Enrollment>("/enrollments/", { course_id });
    return res.data;
  },

  async cancel(id: string): Promise<Enrollment> {
    const res = await api.patch<Enrollment>(`/enrollments/${id}/cancel`);
    return res.data;
  },

  async getById(id: string): Promise<Enrollment> {
    const res = await api.get<Enrollment>(`/enrollments/${id}`);
    return res.data;
  },

  async adminEnroll(user_id: string, course_id: string): Promise<Enrollment> {
    const res = await api.post<Enrollment>("/enrollments/admin", {
      user_id,
      course_id,
    });
    return res.data;
  },
};

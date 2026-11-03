import { api } from "@/lib/api";
import type { Enrollment, EnrollmentStatus } from "@/types";
import { readTotal, type Page } from "@/lib/pagination";

export interface EnrollmentListParams {
  skip?: number;
  limit?: number;
  /** Free text: student name, DNI, email or course title. */
  q?: string;
  status?: EnrollmentStatus;
  course_id?: string;
  user_id?: string;
}

/** Raw API response may include flattened join fields not declared in Enrollment */
type EnrollmentApiRecord = Enrollment & {
  course_name?: string;
  user_name?: string;
  [key: string]: unknown;
};

function normalizeEnrollment(e: EnrollmentApiRecord): Enrollment {
  return {
    ...e,
    course_title: e.course_title ?? e.course_name ?? undefined,
    course_slug: e.course_slug ?? undefined,
    course_type: e.course_type ?? undefined,
    user_full_name: e.user_full_name ?? e.user_name ?? undefined,
    user_email: e.user_email ?? undefined,
  };
}

export const enrollmentsService = {
  /** Server-side paginated + filtered list (names come resolved from the API). */
  async list({ skip = 0, limit = 25, q, status, course_id, user_id }: EnrollmentListParams = {}): Promise<Page<Enrollment>> {
    const params = {
      skip,
      limit,
      ...(q && { q }),
      ...(status && { status }),
      ...(course_id && { course_id }),
      ...(user_id && { user_id }),
    };
    const res = await api.get<EnrollmentApiRecord[]>("/enrollments/", { params });
    return {
      items: res.data.map(normalizeEnrollment),
      total: readTotal(res.headers, skip, res.data.length),
    };
  },

  async getAll(skip = 0, limit = 50, course_id?: string, user_id?: string): Promise<Enrollment[]> {
    const params = { skip, limit, ...(course_id && { course_id }), ...(user_id && { user_id }) };
    const res = await api.get<EnrollmentApiRecord[]>("/enrollments/", { params });
    return res.data.map(normalizeEnrollment);
  },

  async getMyEnrollments(skip = 0, limit = 50): Promise<Enrollment[]> {
    const res = await api.get<EnrollmentApiRecord[]>("/enrollments/my", { params: { skip, limit } });
    return res.data.map(normalizeEnrollment);
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

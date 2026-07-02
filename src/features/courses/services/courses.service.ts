import { api } from "@/lib/api";
import type { Course } from "@/types";
import type { CourseInput } from "../schemas/course.schema";

/** Shape returned by the admin list endpoint — extends Course with flattened join fields. */
type ApiCourseRecord = Course & {
  category_name?: string;
  category_slug?: string;
  instructor_name?: string;
  // Canonical fields now sent directly by /admin/courses
  total_modules?: number;
  total_lessons?: number;
  enrolled_count?: number;
  // Legacy aliases kept for backward-compat
  lessons_count?: number;
  lesson_count?: number;
  modules_count?: number;
  module_count?: number;
  enrollment_count?: number;
  enrollments_count?: number;
};

/** Convert empty strings to null/undefined so the API receives clean data. */
function cleanCoursePayload(data: Partial<CourseInput>): Record<string, unknown> {
  return {
    ...data,
    category_id: data.category_id || null,
    thumbnail_url: data.thumbnail_url || null,
    price: data.price ?? null,
  };
}

export const coursesService = {
  async getAll(
    skip = 0,
    limit = 50,
    q?: string,
    sort_by?: string,
    sort_order?: "asc" | "desc"
  ): Promise<Course[]> {
    const params: Record<string, any> = { skip, limit };
    if (q) params.q = q;
    if (sort_by) params.sort_by = sort_by;
    if (sort_order) params.sort_order = sort_order;

    const res = await api.get<ApiCourseRecord[]>("/admin/courses", {
      params,
    });

    // Normalizar la respuesta para que coincida con el tipo `Course` usado en la UI
    return res.data.map((course: ApiCourseRecord) => ({
      ...course,
      category: course.category_id
        ? {
            id: course.category_id,
            name: course.category_name,
            slug: course.category_slug,
          }
        : undefined,
      instructor: course.instructor_id
        ? {
            id: course.instructor_id,
            first_name: course.instructor_name ?? "",
            last_name: "",
            avatar_url: null,
          }
        : undefined,
      // Handle different field name conventions the API may use
      total_lessons:
        course.total_lessons ??
        course.lessons_count ??
        course.lesson_count ??
        undefined,
      total_modules:
        course.total_modules ??
        course.modules_count ??
        course.module_count ??
        undefined,
      enrolled_count:
        course.enrolled_count ??
        course.enrollment_count ??
        course.enrollments_count ??
        undefined,
    }) as Course);
  },

  async getById(id: string): Promise<Course> {
    const res = await api.get<Course>(`/courses/${id}`);
    return res.data;
  },

  async create(data: CourseInput): Promise<Course> {
    const body = cleanCoursePayload(data);
    const res = await api.post<Course>("/courses/", body);
    return res.data;
  },

  async update(id: string, data: Partial<CourseInput>): Promise<Course> {
    const body = cleanCoursePayload(data);
    const res = await api.put<Course>(`/courses/${id}`, body);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },
};

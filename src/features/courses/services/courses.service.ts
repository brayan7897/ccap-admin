import { api } from "@/lib/api";
import type { Course } from "@/types";
import type { CourseInput } from "../schemas/course.schema";

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
  async getAll(skip = 0, limit = 50): Promise<Course[]> {
    const params = { skip, limit };
    if (process.env.NODE_ENV === "development") {
      console.log("[coursesService.getAll] params:", params);
    }

    const res = await api.get<Course[]>("/admin/courses/", {
      params,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[coursesService.getAll] response:", res.data);
    }

    // Normalizar la respuesta para que coincida con el tipo `Course` usado en la UI
    const normalized = res.data.map((course: any) => {
      const normalizedCourse: Course = {
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
      } as Course;

      return normalizedCourse;
    });

    return normalized;
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


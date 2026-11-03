/**
 * Display helpers for entities that come from the API with their related
 * names already resolved (`user_full_name`, `course_title`).
 *
 * Never fall back to a raw UUID: an id is meaningless to the operator, so a
 * missing relation (deleted user/course) is shown as an explicit label.
 */
export const MISSING_STUDENT = "Usuario eliminado";
export const MISSING_COURSE = "Curso eliminado";

export function studentName(item: { user_full_name?: string | null }): string {
  return item.user_full_name?.trim() || MISSING_STUDENT;
}

export function courseName(item: { course_title?: string | null }): string {
  return item.course_title?.trim() || MISSING_COURSE;
}

const DATE_SHORT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

export function formatDate(
  iso: string | null | undefined,
  options: Intl.DateTimeFormatOptions = DATE_SHORT,
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", options);
}

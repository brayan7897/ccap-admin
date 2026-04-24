// ── Shared TypeScript interfaces ─────────────────────────────────────────────
// Aligned with the ccap-api backend models.

export type DocumentType = "DNI" | "CE" | "PASAPORTE";
export type CourseLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED";
export type CourseAccess = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type CourseType = "FREE" | "PAID";
export type LessonType = "VIDEO" | "PDF" | "TEXT";
export type ResourceType = "MAIN" | "SECONDARY";
export type ResourceFormat = "VIDEO" | "PDF" | "DOCUMENT" | "LINK" | "IMAGE";
export type EnrollmentStatus = "ENROLLED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type NotificationType =
  | "SYSTEM"
  | "COURSE_UPDATE"
  | "ACHIEVEMENT"
  | "PROMOTION"
  | "REMINDER";

// ── RBAC ─────────────────────────────────────────────────────────────────────
export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  permission_count?: number;
  permissions: Permission[];
  created_at: string;
}

// ── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  phone_number: string | null;
  avatar_url: string | null;
  bio: string | null;
  role_id: string;
  role_name: string | null;
  role?: Role;
  is_active: boolean;
  course_access: CourseAccess;
  permissions?: string[];
  created_at: string;
}

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

// ── Courses ───────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  thumbnail_url: string | null;
  course_level: CourseLevel;
  course_type: CourseType;
  price: number | null;
  requirements: string[];
  what_you_will_learn: string[];
  tags: string[];
  is_published: boolean;
  instructor_id: string;
  instructor_name?: string;
  instructor_email?: string;
  category_id: string | null;
  category_name?: string;
  category_slug?: string;
  drive_folder_id?: string | null;
  modules?: Module[];
  created_at: string;
  updated_at: string;
  instructor?: Pick<User, "id" | "first_name" | "last_name" | "avatar_url">;
  category?: Pick<Category, "id" | "name" | "slug">;
  total_modules?: number;
  total_lessons?: number;
  total_duration_seconds?: number;
  enrolled_count?: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  drive_folder_id?: string | null;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_type: LessonType;
  order_index: number;
  duration_seconds: number | null;
  duration_minutes?: number | null;
  drive_file_id: string | null;
  drive_folder_id: string | null;
  drive_folder_url: string | null;
  created_at: string;
  resources?: Resource[];
}

// ── Resource ──────────────────────────────────────────────────────────────────
export interface Resource {
  id: string;
  lesson_id: string;
  title: string;
  resource_type: ResourceType;
  resource_format: ResourceFormat;
  order_index: number;
  drive_file_id: string | null;
  external_url: string | null;
  created_at: string;
}

// ── Enrollment ────────────────────────────────────────────────────────────────
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  enrolled_at: string;

  // Enrichments returned by the API
  course_title?: string;
  course_slug?: string;
  course_type?: CourseType;
  user_full_name?: string;
  user_email?: string;
}

// ── Certificate ───────────────────────────────────────────────────────────────
export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_code: string;
  drive_file_id: string | null;
  pdf_url: string | null;
  html_content: string | null;
  issued_at: string;
}

// ── Drive File ────────────────────────────────────────────────────────────────
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string | null;
  webViewLink: string | null;
  createdTime: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// ── Admin ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  active_users: number;
  pending_users: number;
  total_courses?: number;
  total_enrollments?: number;
  monthly_revenue?: number; // as currency unit (e.g. PEN)
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  is_global: boolean;
  created_at: string;
}

export interface UserNotification {
  id: string;
  notification_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  is_deleted: boolean;
  is_global: boolean;
  read_at: string | null;
  created_at: string;
}

export interface UnreadCount {
  unread_count: number;
}

// ── Notification Viewers (admin) ──────────────────────────────────────────────
export interface NotificationViewerInteraction {
  user_id: string;
  is_read: boolean;
  is_deleted: boolean;
  read_at: string | null;
}

export interface NotificationViewersGlobal {
  notification_id: string;
  is_global: true;
  total_active_users: number;
  seen_count: number;
  viewer_ids: string[];
  interacted_count: number;
  read_count: number;
  deleted_count: number;
}

export interface NotificationViewersDirected {
  notification_id: string;
  is_global: false;
  delivered_to: number;
  read_count: number;
  unread_count: number;
  deleted_count: number;
  interactions: NotificationViewerInteraction[];
}

export type NotificationViewersResponse =
  | NotificationViewersGlobal
  | NotificationViewersDirected;

// ── API Error ─────────────────────────────────────────────────────────────────
export interface ApiError {
  detail: string;
  status_code?: number;
}

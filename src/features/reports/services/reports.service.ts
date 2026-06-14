import { api } from "@/lib/api";
import type {
  ActivityReportItem,
  CertificateReportItem,
  EnrollmentReportItem,
  EnrollmentStatus,
  StudentProgressReportItem,
  UserRegistrationReportItem,
} from "@/types";

export interface EnrollmentsReportParams {
  course_id?: string;
  status?: EnrollmentStatus;
  start_date?: string;
  end_date?: string;
}

export interface StudentProgressReportParams {
  course_id?: string;
  status?: EnrollmentStatus;
  skip?: number;
  limit?: number;
}

export interface CertificatesReportParams {
  course_id?: string;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface UsersRegistrationReportParams {
  role_id?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface ActivityReportParams {
  role_id?: string;
  skip?: number;
  limit?: number;
}

export const reportsService = {
  async getEnrollments(params: EnrollmentsReportParams = {}): Promise<EnrollmentReportItem[]> {
    const res = await api.get<EnrollmentReportItem[]>("/admin/reports/enrollments", { params });
    return res.data;
  },

  async getStudentProgress(params: StudentProgressReportParams = {}): Promise<StudentProgressReportItem[]> {
    const res = await api.get<StudentProgressReportItem[]>("/admin/reports/student-progress", { params });
    return res.data;
  },

  async getCertificates(params: CertificatesReportParams = {}): Promise<CertificateReportItem[]> {
    const res = await api.get<CertificateReportItem[]>("/admin/reports/certificates", { params });
    return res.data;
  },

  async getUsersRegistration(params: UsersRegistrationReportParams = {}): Promise<UserRegistrationReportItem[]> {
    const res = await api.get<UserRegistrationReportItem[]>("/admin/reports/users-registration", { params });
    return res.data;
  },

  async getActivity(params: ActivityReportParams = {}): Promise<ActivityReportItem[]> {
    const res = await api.get<ActivityReportItem[]>("/admin/reports/activity", { params });
    return res.data;
  },
};

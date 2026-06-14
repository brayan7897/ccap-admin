"use client";

import { useQuery } from "@tanstack/react-query";
import {
  reportsService,
  type ActivityReportParams,
  type CertificatesReportParams,
  type EnrollmentsReportParams,
  type StudentProgressReportParams,
  type UsersRegistrationReportParams,
} from "../services/reports.service";

const QUERY_KEY = ["admin-reports"] as const;

export function useEnrollmentsReport(params: EnrollmentsReportParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, "enrollments", params],
    queryFn: () => reportsService.getEnrollments(params),
  });
}

export function useStudentProgressReport(params: StudentProgressReportParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, "student-progress", params],
    queryFn: () => reportsService.getStudentProgress(params),
  });
}

export function useCertificatesReport(params: CertificatesReportParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, "certificates", params],
    queryFn: () => reportsService.getCertificates(params),
  });
}

export function useUsersRegistrationReport(params: UsersRegistrationReportParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, "users-registration", params],
    queryFn: () => reportsService.getUsersRegistration(params),
  });
}

export function useActivityReport(params: ActivityReportParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, "activity", params],
    queryFn: () => reportsService.getActivity(params),
  });
}

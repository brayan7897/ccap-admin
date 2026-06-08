import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteService } from "../services/site.service";
import type {
  CompanyInfoInput,
  FeaturedProfessorInput,
  TestimonialInput,
} from "../schemas/site.schema";

// --- Company Info ---
export const siteKeys = {
  all: ["site"] as const,
  companyInfo: () => [...siteKeys.all, "company-info"] as const,
  featuredProfessors: () => [...siteKeys.all, "featured-professors"] as const,
  testimonials: () => [...siteKeys.all, "testimonials"] as const,
};

export function useCompanyInfo() {
  return useQuery({
    queryKey: siteKeys.companyInfo(),
    queryFn: () => siteService.getCompanyInfo(),
  });
}

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyInfoInput) => siteService.updateCompanyInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.companyInfo() });
    },
  });
}

// --- Featured Professors ---
export function useFeaturedProfessors() {
  return useQuery({
    queryKey: siteKeys.featuredProfessors(),
    queryFn: () => siteService.getFeaturedProfessors(),
  });
}

export function useAddFeaturedProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeaturedProfessorInput) => siteService.addFeaturedProfessor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.featuredProfessors() });
    },
  });
}

export function useRemoveFeaturedProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => siteService.removeFeaturedProfessor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.featuredProfessors() });
    },
  });
}

// --- Testimonials ---
export function useTestimonials() {
  return useQuery({
    queryKey: siteKeys.testimonials(),
    queryFn: () => siteService.getTestimonials(),
  });
}

export function useAddTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TestimonialInput) => siteService.addTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.testimonials() });
    },
  });
}

export function useRemoveTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => siteService.removeTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.testimonials() });
    },
  });
}

export function useToggleFeaturedTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      siteService.toggleFeaturedTestimonial(id, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.testimonials() });
    },
  });
}

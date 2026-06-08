import { api } from "@/lib/api";
import type {
  CompanyInfoResponse,
  CompanyInfoInput,
  FeaturedProfessorResponse,
  FeaturedProfessorInput,
  TestimonialResponse,
  TestimonialInput,
} from "../schemas/site.schema";

export const siteService = {
  // Company Info
  async getCompanyInfo(): Promise<CompanyInfoResponse> {
    const res = await api.get<CompanyInfoResponse>("/site/company-info");
    return res.data;
  },

  async updateCompanyInfo(data: CompanyInfoInput): Promise<CompanyInfoResponse> {
    const res = await api.put<CompanyInfoResponse>("/site/company-info", data);
    return res.data;
  },

  // Featured Professors
  async getFeaturedProfessors(): Promise<FeaturedProfessorResponse[]> {
    const res = await api.get<FeaturedProfessorResponse[]>("/site/featured-professors");
    return res.data;
  },

  async addFeaturedProfessor(data: FeaturedProfessorInput): Promise<FeaturedProfessorResponse> {
    const res = await api.post<FeaturedProfessorResponse>("/site/featured-professors", data);
    return res.data;
  },

  async removeFeaturedProfessor(id: string): Promise<void> {
    await api.delete(`/site/featured-professors/${id}`);
  },

  // Testimonials
  async getTestimonials(): Promise<TestimonialResponse[]> {
    const res = await api.get<TestimonialResponse[]>("/site/testimonials");
    return res.data;
  },

  async addTestimonial(data: TestimonialInput): Promise<TestimonialResponse> {
    const res = await api.post<TestimonialResponse>("/site/testimonials", data);
    return res.data;
  },

  async removeTestimonial(id: string): Promise<void> {
    await api.delete(`/site/testimonials/${id}`);
  },

  async toggleFeaturedTestimonial(id: string, featured: boolean): Promise<TestimonialResponse> {
    const res = await api.patch<TestimonialResponse>(`/site/testimonials/${id}/featured`, {
      featured,
    });
    return res.data;
  },
};

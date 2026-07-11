import { z } from "zod";

// Company Info
// Every optional email/URL field below defaults to "" in CompanyInfoForm
// (initialData?.field || "") when unset — without .or(z.literal("")) that ""
// fails .email()/.url() and blocks the ENTIRE form submit, including fields
// the admin did fill in correctly.
export const companyInfoSchema = z.object({
  phone_number: z.string().optional().nullable(),
  email: z.string().email("Debe ser un email válido").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  facebook_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  instagram_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  twitter_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  youtube_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  linkedin_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  tiktok_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  website_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
});

export type CompanyInfoInput = z.infer<typeof companyInfoSchema>;

export interface CompanyInfoResponse {
  id: string;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  updated_at: string;
}

// Featured Professors
export const featuredProfessorSchema = z.object({
  user_id: z.string().min(1, "El usuario es requerido"),
  specialization: z.string().optional().nullable(),
  image_url: z.string().url("Debe ser una URL válida").optional().nullable().or(z.literal("")),
});

export type FeaturedProfessorInput = z.infer<typeof featuredProfessorSchema>;

export interface FeaturedProfessorResponse {
  id: string;
  user_id: string;
  name: string;
  specialization: string;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

// Testimonials
export const testimonialSchema = z.object({
  user_name: z.string().min(1, "El nombre es requerido"),
  text: z.string().min(1, "El texto es requerido"),
  rating: z.coerce.number().min(1).max(5),
  user_image_url: z.string().url("Debe ser una URL válida").optional().nullable().or(z.literal("")),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export interface TestimonialResponse {
  id: string;
  user_name: string;
  user_image_url: string | null;
  text: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
}

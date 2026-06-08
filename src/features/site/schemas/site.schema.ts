import { z } from "zod";

// Company Info
export const companyInfoSchema = z.object({
  phone_number: z.string().optional().nullable(),
  email: z.string().email("Debe ser un email válido").optional().nullable(),
  address: z.string().optional().nullable(),
  facebook_url: z.string().url("URL inválida").optional().nullable(),
  instagram_url: z.string().url("URL inválida").optional().nullable(),
  twitter_url: z.string().url("URL inválida").optional().nullable(),
  youtube_url: z.string().url("URL inválida").optional().nullable(),
  linkedin_url: z.string().url("URL inválida").optional().nullable(),
  tiktok_url: z.string().url("URL inválida").optional().nullable(),
  website_url: z.string().url("URL inválida").optional().nullable(),
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
  user_image_url: z.string().url("Debe ser una URL válida").optional().nullable(),
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

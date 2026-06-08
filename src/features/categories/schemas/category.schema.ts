import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().optional().nullable(),
  image_url: z.string().url("Debe ser una URL válida").optional().nullable().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}


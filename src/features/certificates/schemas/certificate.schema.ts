import { z } from "zod";

export const certificateCreateSchema = z.object({
  user_id: z.string().uuid("Debe seleccionar un estudiante (UUID inválido)"),
  course_id: z.string().uuid("Debe seleccionar un curso (UUID inválido)"),
  drive_file_id: z.string().optional().or(z.literal("")),
  pdf_url: z.string().url("Debe ser una URL válida (ej. https://...)").optional().or(z.literal("")),
  html_content: z.string().optional().or(z.literal("")),
  issued_at: z.string().optional().or(z.literal("")),
});

export const certificateEditSchema = z.object({
  drive_file_id: z.string().optional().or(z.literal("")),
  pdf_url: z.string().url("Debe ser una URL válida (ej. https://...)").optional().or(z.literal("")),
  html_content: z.string().optional().or(z.literal("")),
});

export type CertificateCreateInput = z.infer<typeof certificateCreateSchema>;
export type CertificateEditInput = z.infer<typeof certificateEditSchema>;

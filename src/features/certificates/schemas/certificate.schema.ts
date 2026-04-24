import { z } from "zod";

export const certificateCreateSchema = z.object({
  user_id: z.string().uuid("Debe ser un UUID válido"),
  course_id: z.string().uuid("Debe ser un UUID válido"),
  drive_file_id: z.string().optional(),
  pdf_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  html_content: z.string().optional(),
});

export const certificateEditSchema = z.object({
  drive_file_id: z.string().optional(),
  pdf_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  html_content: z.string().optional(),
});

export type CertificateCreateInput = z.infer<typeof certificateCreateSchema>;
export type CertificateEditInput = z.infer<typeof certificateEditSchema>;

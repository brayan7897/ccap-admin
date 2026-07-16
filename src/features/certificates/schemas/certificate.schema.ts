import { z } from "zod";

export const certificateCreateSchema = z.object({
  user_id: z.string().uuid("Debe seleccionar un estudiante (UUID inválido)"),
  course_id: z.string().uuid("Debe seleccionar un curso (UUID inválido)"),
  drive_file_id: z.string().optional().or(z.literal("")),
  pdf_url: z.string().url("Debe ser una URL válida (ej. https://...)").optional().or(z.literal("")),
  html_content: z.string().optional().or(z.literal("")),
  issued_at: z.string().optional().or(z.literal("")),
  /** Manual override — omitted (or blank) lets the API auto-generate CCAP-XXXX-XXXX. */
  use_manual_code: z.boolean().optional(),
  certificate_code: z
    .string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(100, "El código no puede superar los 100 caracteres")
    .optional()
    .or(z.literal("")),
}).refine(
  (data) => !data.use_manual_code || !!data.certificate_code?.trim(),
  { message: "Ingresa el código o desmarca la generación manual", path: ["certificate_code"] },
);

export const certificateEditSchema = z.object({
  drive_file_id: z.string().optional().or(z.literal("")),
  pdf_url: z.string().url("Debe ser una URL válida (ej. https://...)").optional().or(z.literal("")),
  html_content: z.string().optional().or(z.literal("")),
});

export type CertificateCreateInput = z.infer<typeof certificateCreateSchema>;
export type CertificateEditInput = z.infer<typeof certificateEditSchema>;

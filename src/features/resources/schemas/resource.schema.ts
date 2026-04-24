import { z } from "zod";

export const resourceSchema = z.object({
  title: z.string().min(2, "Título requerido (mín. 2 caracteres)"),
  resource_type: z.enum(["MAIN", "SECONDARY"]),
  resource_format: z.enum(["VIDEO", "PDF", "DOCUMENT", "LINK", "IMAGE"]),
  order_index: z.number().int().min(0).default(0),
  drive_file_id: z.string().nullable().optional(),
  external_url: z.string().url("URL inválida").nullable().optional(),
});

export type ResourceInput = z.infer<typeof resourceSchema>;

/** Schema for creating a link resource (external URL required) */
export const linkResourceSchema = z.object({
  title: z.string().min(2, "Título requerido (mín. 2 caracteres)"),
  resource_type: z.enum(["MAIN", "SECONDARY"]).default("SECONDARY"),
  order_index: z.number().int().min(0).default(0),
  external_url: z.string().url("URL inválida"),
});

export type LinkResourceInput = z.infer<typeof linkResourceSchema>;

/** Schema for the upload form (no drive_file_id / external_url — those come from the upload flow) */
export const uploadResourceSchema = z.object({
  title: z.string().min(2, "Título requerido (mín. 2 caracteres)"),
  resource_type: z.enum(["MAIN", "SECONDARY"]).default("SECONDARY"),
  resource_format: z
    .enum(["VIDEO", "PDF", "DOCUMENT", "LINK", "IMAGE"])
    .default("VIDEO"),
  order_index: z.number().int().min(0).default(0),
});

export type UploadResourceInput = z.infer<typeof uploadResourceSchema>;

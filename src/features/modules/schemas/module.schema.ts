import { z } from "zod";

export const moduleSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  description: z.string().optional(),
  course_id: z.string().uuid("ID de curso inválido"),
  order_index: z.number().int().min(0).default(0),
});

export type ModuleInput = z.infer<typeof moduleSchema>;

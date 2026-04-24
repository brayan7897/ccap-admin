import { z } from "zod";

export const lessonSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  lesson_type: z.enum(["VIDEO", "PDF", "TEXT"]),
  order_index: z.number().int().min(0).default(0),
  duration_seconds: z.number().int().min(0).optional(),
});

export type LessonInput = z.infer<typeof lessonSchema>;

import { z } from "zod";

// See lessons/schemas/lesson.schema.ts — react-hook-form's `valueAsNumber`
// turns a cleared numeric input into NaN, which still fails `z.number()` and
// silently blocks submit (this field renders no inline error).
const nanToUndefined = (v: unknown) =>
  typeof v === "number" && Number.isNaN(v) ? undefined : v;

export const moduleSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  description: z.string().optional(),
  course_id: z.string().uuid("ID de curso inválido"),
  order_index: z.preprocess(nanToUndefined, z.number().int().min(0).default(0)),
});

export type ModuleInput = z.infer<typeof moduleSchema>;

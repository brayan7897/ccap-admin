import { z } from "zod";

// react-hook-form's `valueAsNumber` turns an empty/cleared numeric input into
// NaN, not undefined — and NaN still fails `z.number()` even on an `.optional()`
// field, blocking submit with no visible error (these fields render none).
// Preprocess NaN -> undefined so "left blank" is treated as "not provided".
const nanToUndefined = (v: unknown) =>
  typeof v === "number" && Number.isNaN(v) ? undefined : v;

export const lessonSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  lesson_type: z.enum(["VIDEO", "PDF", "TEXT"]),
  order_index: z.preprocess(nanToUndefined, z.number().int().min(0).default(0)),
  duration_seconds: z.preprocess(nanToUndefined, z.number().int().min(0).optional()),
});

export type LessonInput = z.infer<typeof lessonSchema>;

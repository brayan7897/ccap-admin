import { z } from "zod";

export const notificationSchema = z.object({
  type: z.enum(["SYSTEM", "COURSE_UPDATE", "ACHIEVEMENT", "PROMOTION", "REMINDER"]),
  title: z.string().min(2, "Título requerido"),
  message: z.string().min(2, "Mensaje requerido"),
  action_url: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  is_global: z.boolean().default(false),
  target_user_ids: z.array(z.string().uuid()).default([]),
});

export type NotificationInput = z.infer<typeof notificationSchema>;

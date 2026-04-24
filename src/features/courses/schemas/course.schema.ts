import { z } from "zod";

export const courseSchema = z
  .object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    slug: z
      .string()
      .min(3, "El slug debe tener al menos 3 caracteres")
      .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
    thumbnail_url: z.string().url("URL inválida").optional().or(z.literal("")),
    short_description: z.string().optional(),
    description: z.string().optional(),
    course_level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
    course_type: z.enum(["FREE", "PAID"]).default("FREE"),
    price: z.coerce.number().positive("El precio debe ser mayor a 0").nullable().optional(),
    category_id: z.string().uuid("Categoría inválida").optional().or(z.literal("")),
    instructor_id: z.string().uuid("Instructor inválido"),
    requirements: z.array(z.string()),
    what_you_will_learn: z.array(z.string()),
    tags: z.array(z.string()),
    is_published: z.boolean(),
  })
  .refine(
    (data) => data.course_type !== "PAID" || (data.price != null && data.price > 0),
    { message: "El precio es requerido para cursos de pago", path: ["price"] },
  );

export type CourseInput = z.infer<typeof courseSchema>;

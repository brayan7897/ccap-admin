import { z } from "zod";

// ── Create user (POST /users/ or POST /users/provisional) ─────────────────────
// `is_provisional` is a client-only flag (never sent to POST /users/provisional,
// and silently ignored by POST /users/): when on, the person has no account yet
// (e.g. issuing them a certificate without a prior self-registration), so no
// password is collected and password validation is skipped.
export const userCreateSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().optional(),
    is_provisional: z.boolean().default(false),
    first_name: z.string().min(2, "Nombre requerido"),
    last_name: z.string().min(2, "Apellido requerido"),
    document_type: z.enum(["DNI", "CE", "PASAPORTE"]),
    document_number: z.string().min(6, "Número de documento requerido"),
    phone_number: z.string().optional(),
    // The native <select> submits "" for the blank/default option — without
    // .or(z.literal("")) that empty string fails .uuid() and blocks submit
    // with no visible error (this field has no inline error message in the form).
    role_id: z
      .string()
      .uuid("ID de rol inválido")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    is_active: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (!data.is_provisional && (!data.password || data.password.length < 8)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La contraseña debe tener al menos 8 caracteres",
        path: ["password"],
      });
    }
  });

/**
 * Admin: update profile fields for any user.
 * Maps to the fields allowed by PUT /users/me (first_name, last_name,
 * phone_number, avatar_url, bio) plus admin-only fields (role, is_active).
 * Document changes use updateDocumentSchema instead.
 */
export const adminEditProfileSchema = z.object({
  first_name: z.string().min(2, "Nombre requerido"),
  last_name: z.string().min(2, "Apellido requerido"),
  phone_number: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  bio: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  avatar_url: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  role_id: z.string().uuid("ID de rol inválido").optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

/**
 * Admin: correct a user's document.
 * Maps to PATCH /users/{user_id}/document
 */
export const updateDocumentSchema = z.object({
  document_type: z.enum(["DNI", "CE", "PASAPORTE"], {
    required_error: "Tipo de documento requerido",
  }),
  document_number: z
    .string()
    .min(6, "El número de documento debe tener al menos 6 caracteres"),
});

/**
 * Admin: approve or reject course access.
 * Maps to PATCH /users/{user_id}/access
 */
export const updateAccessSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    required_error: "Estado requerido",
  }),
});

/** Schema for the logged-in user editing their own profile (PUT /users/me) */
export const profileEditSchema = z.object({
  first_name: z.string().min(2, "Nombre requerido"),
  last_name: z.string().min(2, "Apellido requerido"),
  phone_number: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
  avatar_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

// ── Legacy alias (kept for compatibility with older form components) ───────────
/** @deprecated use adminEditProfileSchema */
export const userEditSchema = z.object({
  first_name: z.string().min(2, "Nombre requerido").optional(),
  last_name: z.string().min(2, "Apellido requerido").optional(),
  document_type: z.enum(["DNI", "CE", "PASAPORTE"]).optional(),
  document_number: z.string().min(6, "Número de documento requerido").optional(),
  phone_number: z.string().optional(),
  role_id: z.string().uuid("ID de rol inválido").optional(),
  is_active: z.boolean().optional(),
});

/** @deprecated use userCreateSchema or adminEditProfileSchema */
export const userSchema = userCreateSchema;

export type UserCreateInput = z.infer<typeof userCreateSchema>;
/** Payload actually sent to POST /users/provisional (no password/is_provisional/is_active). */
export type CreateProvisionalUserInput = Omit<
  UserCreateInput,
  "password" | "is_provisional" | "is_active"
>;
/** @deprecated */
export type UserEditInput = z.infer<typeof userEditSchema>;
export type AdminEditProfileInput = z.infer<typeof adminEditProfileSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type UpdateAccessInput = z.infer<typeof updateAccessSchema>;
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
export type UserInput = UserCreateInput;

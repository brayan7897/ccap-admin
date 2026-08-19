import { z } from "zod";

// ── Document number validation per type ────────────────────────────────────────
// Same rules as ccap-app's registration form, kept in sync so a document that's
// valid on one side of the platform is valid on the other.
function validateDocumentNumber(
  documentType: string,
  documentNumber: string,
  ctx: z.RefinementCtx,
) {
  if (documentType === "DNI" && !/^\d{8}$/.test(documentNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El DNI debe tener exactamente 8 dígitos numéricos",
      path: ["document_number"],
    });
  }
  if (documentType === "CE" && !/^\d{9}$/.test(documentNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El carné de extranjería debe tener exactamente 9 dígitos numéricos",
      path: ["document_number"],
    });
  }
  if (documentType === "PASAPORTE" && !/^[A-Z0-9]{6,12}$/i.test(documentNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos",
      path: ["document_number"],
    });
  }
  if (documentType === "RUC" && !/^(10|15|16|17|20)\d{9}$/.test(documentNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El RUC debe tener 11 dígitos numéricos y empezar con 10, 15, 16, 17 o 20",
      path: ["document_number"],
    });
  }
}

// ── Create user (POST /users/ or POST /users/provisional) ─────────────────────
// `is_provisional` is a client-only flag, never sent to either endpoint: when
// on, the person has no account yet (e.g. issuing them a certificate without a
// prior self-registration), so no password is collected and password
// validation is skipped.
//
// `role_id` and `is_active` are also client-only for the non-provisional path:
// POST /users/ is the SAME public self-registration endpoint, so it never
// accepted is_active and no longer accepts role_id either (removed there on
// purpose — see ccap-api's CreateUserRequest docstring). UserModal applies
// both as separate, already admin-gated follow-up calls after creation
// instead of sending them in this request.
export const userCreateSchema = z
  .object({
    email: z.string().email("Email inválido"),
    // Same policy the backend enforces on every password-setting endpoint
    // (checked below in superRefine): 8-128 chars, lower + upper + digit.
    password: z.string().optional(),
    is_provisional: z.boolean().default(false),
    first_name: z.string().min(2, "Nombre requerido"),
    last_name: z.string().min(2, "Apellido requerido"),
    document_type: z.enum(["DNI", "CE", "PASAPORTE", "RUC"]),
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
    if (!data.is_provisional) {
      if (!data.password || data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La contraseña debe tener al menos 8 caracteres",
          path: ["password"],
        });
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe tener mayúsculas, minúsculas y un número",
          path: ["password"],
        });
      }
    }
    validateDocumentNumber(data.document_type, data.document_number, ctx);
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
export const updateDocumentSchema = z
  .object({
    document_type: z.enum(["DNI", "CE", "PASAPORTE", "RUC"], {
      required_error: "Tipo de documento requerido",
    }),
    document_number: z
      .string()
      .min(6, "El número de documento debe tener al menos 6 caracteres"),
  })
  .superRefine((data, ctx) => {
    validateDocumentNumber(data.document_type, data.document_number, ctx);
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
  document_type: z.enum(["DNI", "CE", "PASAPORTE", "RUC"]).optional(),
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
/**
 * Payload actually sent to POST /users/ (no is_provisional/is_active/role_id
 * — that endpoint never accepted the first two and no longer accepts
 * role_id; UserModal applies those as separate admin-gated follow-up calls).
 */
export type RegisterUserInput = Omit<
  UserCreateInput,
  "is_provisional" | "is_active" | "role_id"
>;
/** @deprecated */
export type UserEditInput = z.infer<typeof userEditSchema>;
export type AdminEditProfileInput = z.infer<typeof adminEditProfileSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type UpdateAccessInput = z.infer<typeof updateAccessSchema>;
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
export type UserInput = UserCreateInput;

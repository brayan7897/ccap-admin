import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  first_name: z.string().min(2, "Nombre requerido"),
  last_name: z.string().min(2, "Apellido requerido"),
  document_type: z.enum(["DNI", "CE", "PASAPORTE"]),
  document_number: z.string().min(6, "Número de documento requerido"),
  phone_number: z.string().optional(),
  role_id: z.string().uuid("ID de rol inválido").optional(),
  is_active: z.boolean().default(true),
});

export const userEditSchema = z.object({
  first_name: z.string().min(2, "Nombre requerido").optional(),
  last_name: z.string().min(2, "Apellido requerido").optional(),
  document_type: z.enum(["DNI", "CE", "PASAPORTE"]).optional(),
  document_number: z.string().min(6, "Número de documento requerido").optional(),
  phone_number: z.string().optional(),
  role_id: z.string().uuid("ID de rol inválido").optional(),
  is_active: z.boolean().optional(),
});

/** Schema for the logged-in user editing their own profile (PUT /users/me) */
export const profileEditSchema = z.object({
  first_name: z.string().min(2, "Nombre requerido"),
  last_name: z.string().min(2, "Apellido requerido"),
  phone_number: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
  avatar_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

/** @deprecated use userCreateSchema or userEditSchema */
export const userSchema = userCreateSchema;

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserEditInput = z.infer<typeof userEditSchema>;
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
export type UserInput = UserCreateInput;

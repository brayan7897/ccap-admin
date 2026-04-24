import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  is_system_role: z.boolean().default(false),
});

export const permissionSchema = z.object({
  code: z.string().min(2, "Código requerido"),
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
});

export const assignPermissionSchema = z.object({
  permission_id: z.string().uuid("ID de permiso inválido"),
});

export type RoleInput = z.infer<typeof roleSchema>;
export type PermissionInput = z.infer<typeof permissionSchema>;
export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>;

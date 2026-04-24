"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AssignPermissionInput,
  PermissionInput,
  RoleInput,
} from "../schemas/role.schema";
import { rolesService } from "../services/roles.service";

const ROLES_KEY = ["roles"] as const;
const PERMS_KEY = ["permissions"] as const;

// ── Role queries ──────────────────────────────────────────────────────────────
export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => rolesService.getAll(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: [...ROLES_KEY, id],
    queryFn: () => rolesService.getById(id),
    enabled: !!id,
  });
}

// ── Role mutations ────────────────────────────────────────────────────────────
export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleInput) => rolesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success("Rol creado correctamente.");
    },
    onError: () => toast.error("Error al crear el rol."),
  });
}

export function useUpdateRole(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RoleInput>) => rolesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success("Rol actualizado.");
    },
    onError: () => toast.error("Error al actualizar el rol."),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success("Rol eliminado.");
    },
    onError: () => toast.error("Error al eliminar el rol."),
  });
}

// ── Permission queries ────────────────────────────────────────────────────────
export function usePermissions() {
  return useQuery({
    queryKey: PERMS_KEY,
    queryFn: () => rolesService.getAllPermissions(),
  });
}

export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PermissionInput) => rolesService.createPermission(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PERMS_KEY });
      toast.success("Permiso creado.");
    },
    onError: () => toast.error("Error al crear el permiso."),
  });
}

export function useUpdatePermission(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PermissionInput>) => rolesService.updatePermission(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PERMS_KEY });
      toast.success("Permiso actualizado.");
    },
    onError: () => toast.error("Error al actualizar el permiso."),
  });
}

export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesService.deletePermission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PERMS_KEY });
      toast.success("Permiso eliminado.");
    },
    onError: () => toast.error("Error al eliminar el permiso."),
  });
}

export function useAssignPermission(roleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignPermissionInput) =>
      rolesService.assignPermission(roleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...ROLES_KEY, roleId] });
      toast.success("Permiso asignado.");
    },
    onError: () => toast.error("Error al asignar el permiso."),
  });
}

export function useRevokePermission(roleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) =>
      rolesService.revokePermission(roleId, permissionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...ROLES_KEY, roleId] });
      toast.success("Permiso revocado.");
    },
    onError: () => toast.error("Error al revocar el permiso."),
  });
}

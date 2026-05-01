import { api } from "@/lib/api";
import type { Permission, PaginatedResponse, Role } from "@/types";
import type {
  AssignPermissionInput,
  PermissionInput,
  RoleInput,
} from "../schemas/role.schema";

export const rolesService = {
  // ── Roles CRUD ────────────────────────────────────────────────────────────
  async getAll(): Promise<Role[]> {
    const res = await api.get<Role[]>("/roles/");
    return res.data;
  },

  async getById(id: string): Promise<Role> {
    const res = await api.get<Role>(`/roles/${id}`);
    return res.data;
  },

  async create(data: RoleInput): Promise<Role> {
    const res = await api.post<Role>("/roles/", data);
    return res.data;
  },

  async update(id: string, data: Partial<RoleInput>): Promise<Role> {
    const res = await api.put<Role>(`/roles/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

  // ── Permissions ───────────────────────────────────────────────────────────
  async getAllPermissions(): Promise<Permission[]> {
    const res = await api.get<Permission[]>("/roles/permissions/all");
    return res.data;
  },

  async createPermission(data: PermissionInput): Promise<Permission> {
    const res = await api.post<Permission>("/roles/permissions", data);
    return res.data;
  },

  async updatePermission(id: string, data: Partial<PermissionInput>): Promise<Permission> {
    const res = await api.put<Permission>(`/roles/permissions/${id}`, data);
    return res.data;
  },

  async deletePermission(id: string): Promise<void> {
    await api.delete(`/roles/permissions/${id}`);
  },

  async assignPermission(
    roleId: string,
    data: AssignPermissionInput,
  ): Promise<void> {
    await api.post(`/roles/${roleId}/permissions`, data);
  },

  async revokePermission(roleId: string, permissionId: string): Promise<void> {
    await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  },
};

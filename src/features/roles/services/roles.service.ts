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
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.getAll] GET /roles/");
    }
    const res = await api.get<Role[]>("/roles/");
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.getAll] response", res.data);
    }
    return res.data;
  },

  async getById(id: string): Promise<Role> {
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.getById] GET /roles/" + id);
    }
    const res = await api.get<Role>(`/roles/${id}`);
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.getById] response", res.data);
    }
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
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.getAllPermissions] GET /roles/permissions/all");
    }
    const res = await api.get<Permission[]>("/roles/permissions/all");
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.getAllPermissions] response", res.data);
    }
    return res.data;
  },

  async createPermission(data: PermissionInput): Promise<Permission> {
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.createPermission] POST /roles/permissions", data);
    }
    const res = await api.post<Permission>("/roles/permissions", data);
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.createPermission] response", res.data);
    }
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
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.assignPermission] POST /roles/" + roleId + "/permissions", data);
    }
    const res = await api.post(`/roles/${roleId}/permissions`, data);
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.assignPermission] response", res.data);
    }
  },

  async revokePermission(roleId: string, permissionId: string): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.revokePermission] DELETE /roles/" + roleId + "/permissions/" + permissionId);
    }
    const res = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    if (process.env.NODE_ENV === "development") {
      console.log("[rolesService.revokePermission] response", res.data);
    }
  },
};

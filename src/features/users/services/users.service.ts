import { api } from "@/lib/api";
import type { AdminStats, User } from "@/types";
import type { UserCreateInput, UserEditInput } from "../schemas/user.schema";

export const usersService = {
  // ── Admin: list all users ─────────────────────────────────────────────────
  async getAll(
    skip = 0,
    limit = 50,
    is_active?: boolean,
  ): Promise<User[]> {
    const params = { skip, limit, ...(is_active !== undefined && { is_active }) };
    if (process.env.NODE_ENV === "development") {
      console.log("[usersService.getAll] params:", params);
    }

    const res = await api.get<User[]>("/admin/users", { params });

    if (process.env.NODE_ENV === "development") {
      console.log("[usersService.getAll] response:", res.data);
    }

    return res.data;
  },

  // ── Admin: pending users waiting for account activation (is_active=false) ─
  async getPending(): Promise<User[]> {
    const res = await api.get<User[]>("/admin/users/pending");
    return res.data;
  },

  // ── Admin: users waiting for course access approval ────────────────────────
  async getPendingAccess(): Promise<User[]> {
    const res = await api.get<User[]>("/users/pending-access");
    return res.data;
  },

  // ── Public: register new user ─────────────────────────────────────────────
  async create(data: UserCreateInput): Promise<User> {
    const res = await api.post<User>("/users/", data);
    return res.data;
  },

  // ── Admin: approve or reject course access ────────────────────────────────
  async updateAccess(userId: string, status: "APPROVED" | "REJECTED"): Promise<User> {
    if (process.env.NODE_ENV === "development") {
      console.log("[usersService.updateAccess] payload:", {
        userId,
        status,
      });
    }

    const res = await api.patch<User>(`/users/${userId}/access`, { status });

    if (process.env.NODE_ENV === "development") {
      console.log("[usersService.updateAccess] response:", res.data);
    }

    return res.data;
  },

  // ── Public/ActiveUser: get any user by id ─────────────────────────────────
  async getById(id: string): Promise<User> {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },

  // ── CurrentUser: get own full profile ────────────────────────────────────
  async getMe(): Promise<User> {
    const res = await api.get<User>("/users/me");
    return res.data;
  },

  // ── CurrentUser: update own profile ──────────────────────────────────────
  async updateMe(data: UserEditInput): Promise<User> {
    const res = await api.put<User>("/users/me", data);
    return res.data;
  },

  // ── Admin: activate / deactivate user ────────────────────────────────────
  async setActive(id: string, is_active: boolean): Promise<User> {
    const res = await api.patch<User>(`/admin/users/${id}/activate`, {
      is_active,
    });
    return res.data;
  },

  // ── Admin: change user role ───────────────────────────────────────────────
  async changeRole(id: string, role_id: string): Promise<User> {
    const res = await api.patch<User>(`/admin/users/${id}/role`, undefined, {
      params: { role_id },
    });
    return res.data;
  },

  // ── Admin: general stats ──────────────────────────────────────────────────
  async getStats(): Promise<AdminStats> {
    const res = await api.get<AdminStats>("/admin/stats");
    return res.data;
  },

  // ── Admin: delete user ───────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },
};

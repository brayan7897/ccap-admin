import { api } from "@/lib/api";
import type { AdminStats, User } from "@/types";
import type {
  AdminEditProfileInput,
  UpdateDocumentInput,
  UserCreateInput,
  UserEditInput,
} from "../schemas/user.schema";

export const usersService = {
  // ── Admin: list all users ─────────────────────────────────────────────────
  async getAll(
    skip = 0,
    limit = 50,
    is_active?: boolean,
  ): Promise<User[]> {
    const params = { skip, limit, ...(is_active !== undefined && { is_active }) };
    const res = await api.get<User[]>("/admin/users", { params });
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

  // ── Admin: update profile fields of any user ──────────────────────────────
  // Maps to PUT /admin/users/{id}
  // Fields: first_name, last_name, phone_number, bio, avatar_url
  // Role and activation are handled by dedicated endpoints below.
  async updateProfile(userId: string, data: AdminEditProfileInput): Promise<User> {
    const profilePayload: Record<string, unknown> = {
      first_name: data.first_name,
      last_name: data.last_name,
    };
    if (data.phone_number !== undefined) profilePayload.phone_number = data.phone_number || null;
    if (data.bio !== undefined) profilePayload.bio = data.bio || null;
    if (data.avatar_url !== undefined) profilePayload.avatar_url = data.avatar_url || null;

    const res = await api.put<User>(`/admin/users/${userId}`, profilePayload);
    return res.data;
  },

  // ── Admin: correct or replace a user's document ──────────────────────────
  // Maps to PATCH /users/{user_id}/document
  async updateDocument(userId: string, data: UpdateDocumentInput): Promise<User> {
    const res = await api.patch<User>(`/users/${userId}/document`, data);
    return res.data;
  },

  // ── Admin: approve or reject course access ────────────────────────────────
  // Maps to PATCH /users/{user_id}/access
  async updateAccess(userId: string, status: "APPROVED" | "REJECTED"): Promise<User> {
    const res = await api.patch<User>(`/users/${userId}/access`, { status });
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
  async updateMe(
    data: Pick<AdminEditProfileInput, "first_name" | "last_name" | "phone_number" | "bio" | "avatar_url">,
  ): Promise<User> {
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

  // ── Admin: pending password resets ───────────────────────────────────────
  async getPendingPasswordResets(): Promise<any[]> {
    const res = await api.get<any[]>("/auth/password-reset/pending");
    return res.data;
  },

  // ── Admin: reset user password ───────────────────────────────────────────
  async resetPassword(userId: string, new_password: string): Promise<{ detail: string }> {
    const res = await api.patch<{ detail: string }>(`/users/${userId}/password`, { new_password });
    return res.data;
  },
};

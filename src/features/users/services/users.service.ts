import { api } from "@/lib/api";
import type { AdminStats, PendingEmailChange, User } from "@/types";
import type {
  AdminEditProfileInput,
  CreateProvisionalUserInput,
  RegisterUserInput,
  UpdateDocumentInput,
  UserEditInput,
} from "../schemas/user.schema";

export const usersService = {
  // ── Admin: list all users ─────────────────────────────────────────────────
  async getAll(
    skip = 0,
    limit = 50,
    is_active?: boolean,
    q?: string,
    sort_by?: string,
    sort_order?: "asc" | "desc",
    role_id?: string
  ): Promise<User[]> {
    const params: Record<string, any> = { skip, limit };
    if (is_active !== undefined) params.is_active = is_active;
    if (q) params.q = q;
    if (sort_by) params.sort_by = sort_by;
    if (sort_order) params.sort_order = sort_order;
    if (role_id) params.role_id = role_id;

    const res = await api.get<User[]>("/admin/users", { params });
    return res.data;
  },

  // ── Admin: pending users waiting for account activation (is_active=false) ─
  async getPending(
    skip = 0,
    limit = 50,
    q?: string,
    sort_by?: string,
    sort_order?: "asc" | "desc"
  ): Promise<User[]> {
    const params: Record<string, any> = { skip, limit };
    if (q) params.q = q;
    if (sort_by) params.sort_by = sort_by;
    if (sort_order) params.sort_order = sort_order;

    const res = await api.get<User[]>("/admin/users/pending", { params });
    return res.data;
  },

  // ── Admin: users waiting for course access approval ────────────────────────
  async getPendingAccess(
    skip = 0,
    limit = 50,
    q?: string,
    sort_by?: string,
    sort_order?: "asc" | "desc"
  ): Promise<User[]> {
    const params: Record<string, any> = { skip, limit, course_access: "PENDING" };
    if (q) params.q = q;
    if (sort_by) params.sort_by = sort_by;
    if (sort_order) params.sort_order = sort_order;
    
    const res = await api.get<User[]>("/admin/users", { params });
    return res.data;
  },

  // ── Public: register new user ─────────────────────────────────────────────
  async create(data: RegisterUserInput): Promise<User> {
    const res = await api.post<User>("/users/", data);
    return res.data;
  },

  // ── Admin: create a person with no password yet (e.g. to issue a certificate
  // to someone who never self-registered). Claimed automatically when they
  // later register with the same document + email.
  async createProvisional(data: CreateProvisionalUserInput): Promise<User> {
    const res = await api.post<User>("/users/provisional", data);
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

  // ── Admin: change user email directly ────────────────────────────────────
  async updateEmail(userId: string, new_email: string): Promise<User> {
    const res = await api.patch<User>(`/users/${userId}/email`, { new_email });
    return res.data;
  },

  // ── Admin: pending email-change requests ─────────────────────────────────
  async getPendingEmailChanges(): Promise<PendingEmailChange[]> {
    const res = await api.get<PendingEmailChange[]>("/users/email-change/pending");
    return res.data;
  },

  // ── Admin: reject a pending email-change request without applying it ────
  async rejectEmailChange(userId: string): Promise<void> {
    await api.delete(`/users/email-change/pending/${userId}`);
  },
};

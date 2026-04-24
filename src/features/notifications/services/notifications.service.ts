import { api } from "@/lib/api";
import type { Notification, NotificationViewersResponse, UnreadCount, UserNotification } from "@/types";
import type { NotificationInput } from "../schemas/notification.schema";

export const notificationsService = {
  // Admin
  async getAll(skip = 0, limit = 50): Promise<Notification[]> {
    const res = await api.get<Notification[]>("/notifications/", { params: { skip, limit } });
    return res.data;
  },

  async create(data: NotificationInput): Promise<Notification> {
    const res = await api.post<Notification>("/notifications/", data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  // Inbox (any active user)
  async getInbox(
    skip = 0,
    limit = 50,
    unread_only = false,
  ): Promise<UserNotification[]> {
    const res = await api.get<UserNotification[]>("/notifications/inbox", {
      params: { skip, limit, unread_only },
    });
    return res.data;
  },

  async getUnreadCount(): Promise<UnreadCount> {
    const res = await api.get<UnreadCount>("/notifications/inbox/unread-count");
    return res.data;
  },

  async markRead(pivotId: string): Promise<UserNotification> {
    const res = await api.patch<UserNotification>(
      `/notifications/inbox/${pivotId}/read`,
    );
    return res.data;
  },

  async markAllRead(): Promise<{ marked_read: number }> {
    const res = await api.patch<{ marked_read: number }>(
      "/notifications/inbox/read-all",
    );
    return res.data;
  },

  async deleteFromInbox(pivotId: string): Promise<void> {
    await api.delete(`/notifications/inbox/${pivotId}`);
  },

  // Uses notification_id (not pivot id) — records view in Redis SET without marking as read
  async markSeen(notificationId: string): Promise<void> {
    await api.patch(`/notifications/inbox/${notificationId}/seen`);
  },

  // Admin: see who viewed/read a notification
  async getViewers(notificationId: string): Promise<NotificationViewersResponse> {
    const res = await api.get<NotificationViewersResponse>(
      `/notifications/${notificationId}/viewers`,
    );
    return res.data;
  },
};

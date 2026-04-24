"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { NotificationInput } from "../schemas/notification.schema";
import { notificationsService } from "../services/notifications.service";

const QUERY_KEY = ["notifications"] as const;
const INBOX_KEY = ["notifications", "inbox"] as const;
const UNREAD_KEY = ["notifications", "unread-count"] as const;

// ── Admin ─────────────────────────────────────────────────────────────────────
export function useNotifications(skip = 0, limit = 50) {
  return useQuery({
    queryKey: [...QUERY_KEY, { skip, limit }],
    queryFn: () => notificationsService.getAll(skip, limit),
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationInput) => notificationsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Notificación enviada.");
    },
    onError: () => toast.error("Error al enviar la notificación."),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Notificación eliminada.");
    },
    onError: () => toast.error("Error al eliminar la notificación."),
  });
}

// ── Inbox (active user) ───────────────────────────────────────────────────────
export function useInbox(limit = 5) {
  return useQuery({
    queryKey: [...INBOX_KEY, { limit }],
    queryFn: () => notificationsService.getInbox(0, limit),
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30_000, // poll every 30s
    staleTime: 0,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pivotId: string) => notificationsService.markRead(pivotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INBOX_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_KEY });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INBOX_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_KEY });
      toast.success("Todas marcadas como leídas.");
    },
  });
}

export function useDeleteFromInbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pivotId: string) => notificationsService.deleteFromInbox(pivotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INBOX_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_KEY });
    },
  });
}

// Fire-and-forget: records in Redis SET that the user saw the notification.
// Uses notification_id (not pivot id). No cache invalidation needed.
export function useMarkSeen() {
  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.markSeen(notificationId),
  });
}

// Admin: stats on who viewed/read a notification
export function useViewers(notificationId: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, notificationId, "viewers"],
    queryFn: () => notificationsService.getViewers(notificationId!),
    enabled: !!notificationId,
    staleTime: 60_000,
  });
}

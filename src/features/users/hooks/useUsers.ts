"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsService } from "@/features/notifications/services/notifications.service";
import type { User } from "@/types";
import type { UserCreateInput, ProfileEditInput } from "../schemas/user.schema";
import { usersService } from "../services/users.service";

const QUERY_KEY = ["users"] as const;

export function useUsers(skip = 0, limit = 50, is_active?: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEY, { skip, limit, is_active }],
    queryFn: () => usersService.getAll(skip, limit, is_active),
  });
}

export function usePendingUsers() {
  return useQuery({
    queryKey: [...QUERY_KEY, "pending"],
    queryFn: () => usersService.getPending(),
  });
}

export function usePendingAccessUsers() {
  return useQuery({
    queryKey: [...QUERY_KEY, "pending-access"],
    queryFn: () => usersService.getPendingAccess(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => usersService.getStats(),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreateInput) => usersService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });
      toast.success("Usuario creado correctamente.");
    },
    onError: () => {
      toast.error("Error al crear el usuario.");
    },
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      usersService.setActive(id, is_active),
    onSuccess: (_, { is_active }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });
      toast.success(is_active ? "Usuario activado." : "Usuario desactivado.");
    },
    onError: () => {
      toast.error("Error al cambiar el estado del usuario.");
    },
  });
}

export function useUpdateUserAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "APPROVED" | "REJECTED" }) =>
      usersService.updateAccess(userId, status),
    onSuccess: async (updatedUser, { status }) => {
      // Immediately patch the cached list so the UI reflects the change without
      // waiting for the background refetch (fixes stale-list display issue).
      qc.setQueriesData<User[]>(
        { queryKey: QUERY_KEY, exact: false },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.map((u) =>
            u.id === updatedUser.id ? { ...u, course_access: updatedUser.course_access } : u,
          );
        },
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });
      toast.success(
        status === "APPROVED" ? "Acceso aprobado." : "Acceso rechazado.",
      );
      // Send automatic notification to the user
      try {
        qc.invalidateQueries({ queryKey: ["notifications"] });
      } catch {
        // Notification failure is non-blocking
      }
    },
    onError: () => {
      toast.error("Error al actualizar el acceso del usuario.");
    },
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role_id }: { id: string; role_id: string }) =>
      usersService.changeRole(id, role_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });
      toast.success("Rol actualizado correctamente.");
    },
    onError: () => {
      toast.error("Error al cambiar el rol.");
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });
      toast.success("Usuario eliminado.");
    },
    onError: () => {
      toast.error("Error al eliminar el usuario.");
    },
  });
}

// ── Current user profile ──────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => usersService.getMe(),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileEditInput) => usersService.updateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Perfil actualizado correctamente.");
    },
    onError: () => {
      toast.error("Error al actualizar el perfil.");
    },
  });
}

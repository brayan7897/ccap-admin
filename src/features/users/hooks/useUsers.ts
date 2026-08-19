"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/types";
import type {
  AdminEditProfileInput,
  CreateProvisionalUserInput,
  ProfileEditInput,
  RegisterUserInput,
  UpdateDocumentInput,
} from "../schemas/user.schema";
import { usersService } from "../services/users.service";
import { useDataStore } from "@/store/data-store";
import { getErrorDetail } from "@/lib/api";

const QUERY_KEY = ["users"] as const;
const CATALOG_KEY = ["catalog", "users"] as const;

export function useUsers(
  skip = 0,
  limit = 50,
  is_active?: boolean,
  q?: string,
  sort_by?: string,
  sort_order?: "asc" | "desc"
) {
  return useQuery({
    queryKey: [...QUERY_KEY, { skip, limit, is_active, q, sort_by, sort_order }],
    queryFn: () => usersService.getAll(skip, limit, is_active, q, sort_by, sort_order),
    staleTime: 3 * 60 * 1000, // 3 min — admin user lists change infrequently
    placeholderData: keepPreviousData,
  });
}

export function usePendingUsers() {
  return useQuery({
    queryKey: [...QUERY_KEY, "pending"],
    queryFn: () => usersService.getPending(),
    staleTime: 2 * 60 * 1000, // 2 min — pending users need timely but not instant updates
  });
}

export function usePendingAccessUsers() {
  return useQuery({
    queryKey: [...QUERY_KEY, "pending-access"],
    queryFn: () => usersService.getPendingAccess(),
    staleTime: 2 * 60 * 1000, // 2 min
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
    staleTime: 5 * 60 * 1000, // 5 min — aggregate stats are not real-time
  });
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterUserInput) => usersService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });

      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Usuario creado correctamente.");
    },
    onError: (error) => {
      toast.error(getErrorDetail(error, "Error al crear el usuario."));
    },
  });
}

export function useCreateProvisionalUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProvisionalUserInput) => usersService.createProvisional(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });
      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Persona registrada sin cuenta. Ya puedes matricularla y emitirle certificados.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Error al registrar a la persona.");
    },
  });
}

// ── Admin: update profile (first_name, last_name, phone, bio, avatar) ─────────
// Calls PUT /admin/users/{id} — does NOT touch document or role.

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AdminEditProfileInput }) =>
      usersService.updateProfile(userId, data),
    onSuccess: (updatedUser) => {
      // Patch individual cache entry
      qc.setQueryData<User>([...QUERY_KEY, updatedUser.id], updatedUser);
      // Patch list caches optimistically
      qc.setQueriesData<User[]>(
        { queryKey: QUERY_KEY, exact: false },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        },
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });

      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Perfil del usuario actualizado.");
    },
    onError: () => {
      toast.error("Error al actualizar el perfil del usuario.");
    },
  });
}

// ── Admin: update document (PATCH /users/{user_id}/document) ─────────────────

export function useUpdateUserDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateDocumentInput }) =>
      usersService.updateDocument(userId, data),
    onSuccess: (updatedUser) => {
      qc.setQueryData<User>([...QUERY_KEY, updatedUser.id], updatedUser);
      qc.setQueriesData<User[]>(
        { queryKey: QUERY_KEY, exact: false },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        },
      );
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });

      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Documento actualizado correctamente.");
    },
    onError: () => {
      toast.error("Error al actualizar el documento. Verifica que no esté en uso.");
    },
  });
}

// ── Admin: activate / deactivate ─────────────────────────────────────────────

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      usersService.setActive(id, is_active),
    onSuccess: (_, { is_active }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });

      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success(is_active ? "Usuario activado." : "Usuario desactivado.");
    },
    onError: () => {
      toast.error("Error al cambiar el estado del usuario.");
    },
  });
}

// ── Admin: approve / reject course access ─────────────────────────────────────

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

      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success(
        status === "APPROVED" ? "Acceso aprobado." : "Acceso rechazado.",
      );
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

// ── Admin: change role ────────────────────────────────────────────────────────

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role_id }: { id: string; role_id: string }) =>
      usersService.changeRole(id, role_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });

      qc.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Rol actualizado correctamente.");
    },
    onError: () => {
      toast.error("Error al cambiar el rol.");
    },
  });
}

// ── Admin: delete ─────────────────────────────────────────────────────────────

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });

      qc.invalidateQueries({ queryKey: CATALOG_KEY });
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

// ── Password Resets ───────────────────────────────────────────────────────────

export function usePendingPasswordResets() {
  return useQuery({
    queryKey: [...QUERY_KEY, "password-resets", "pending"],
    queryFn: () => usersService.getPendingPasswordResets(),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, new_password }: { userId: string; new_password: string }) =>
      usersService.resetPassword(userId, new_password),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, "password-resets", "pending"] });
      toast.success(data.detail || "Contraseña actualizada exitosamente.");
    },
    onError: () => {
      toast.error("Error al restablecer la contraseña.");
    },
  });
}

// ── Admin: change user email directly ──────────────────────────────────────────

export function useUpdateEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, new_email }: { userId: string; new_email: string }) =>
      usersService.updateEmail(userId, new_email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false });
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, "email-changes", "pending"] });
      toast.success("Correo actualizado. El usuario debe iniciar sesión de nuevo.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Error al cambiar el correo.");
    },
  });
}

// ── Email-change requests ─────────────────────────────────────────────────────

export function usePendingEmailChanges() {
  return useQuery({
    queryKey: [...QUERY_KEY, "email-changes", "pending"],
    queryFn: () => usersService.getPendingEmailChanges(),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export function useRejectEmailChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.rejectEmailChange(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, "email-changes", "pending"] });
      toast.success("Solicitud rechazada.");
    },
    onError: () => {
      toast.error("Error al rechazar la solicitud.");
    },
  });
}

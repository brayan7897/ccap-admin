"use client";

import { useState } from "react";
import { X, User as UserIcon, FileText, ShieldCheck, Lock, Unlock, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@/types";
import {
  adminEditProfileSchema,
  updateDocumentSchema,
  userCreateSchema,
  type AdminEditProfileInput,
  type UpdateDocumentInput,
  type UserCreateInput,
} from "@/features/users/schemas/user.schema";
import {
  useCreateUser,
  useCreateProvisionalUser,
  useActivateUser,
  useChangeUserRole,
  useUpdateUserProfile,
  useUpdateUserDocument,
} from "@/features/users/hooks/useUsers";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { Portal } from "./Portal";

// ── Shared field style ────────────────────────────────────────────────────────
const FIELD =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const DOC_TYPES = ["DNI", "CE", "PASAPORTE"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "profile" | "document" | "access";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onResetPassword?: (user: User) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-forms
// ─────────────────────────────────────────────────────────────────────────────

/** CREATE mode: single form that matches POST /users/ */
function CreateUserForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const createUser = useCreateUser();
  const createProvisionalUser = useCreateProvisionalUser();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<UserCreateInput, any, UserCreateInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(userCreateSchema) as any,
    defaultValues: { document_type: "DNI", is_active: true, is_provisional: false },
  });

  const isProvisional = watch("is_provisional");
  const isPending = createUser.isPending || createProvisionalUser.isPending;

  function onSubmit(data: UserCreateInput) {
    if (data.is_provisional) {
      const { password, is_provisional, is_active, ...payload } = data;
      createProvisionalUser.mutate(payload, { onSuccess: onClose });
    } else {
      createUser.mutate(data, { onSuccess: onClose });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Datos Personales */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-primary" />
          Datos Personales
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre *</label>
            <input {...register("first_name")} placeholder="Ana" className={FIELD} />
            {errors.first_name && (
              <p className="text-xs text-destructive">{errors.first_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Apellido *</label>
            <input {...register("last_name")} placeholder="García" className={FIELD} />
            {errors.last_name && (
              <p className="text-xs text-destructive">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de doc. *</label>
            <select {...register("document_type")} className={FIELD}>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">N.º de documento *</label>
            <input
              {...register("document_number")}
              placeholder="12345678"
              className={FIELD}
            />
            {errors.document_number && (
              <p className="text-xs text-destructive">{errors.document_number.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Teléfono</label>
          <input
            {...register("phone_number")}
            placeholder="+51 999 000 000"
            className={FIELD}
          />
        </div>
      </div>

      {/* Credenciales y Acceso */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Credenciales y Acceso
        </h3>

        <div className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3">
          <input
            type="checkbox"
            id="create_is_provisional"
            {...register("is_provisional")}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="create_is_provisional" className="text-sm">
            <span className="font-medium">Esta persona aún no tiene cuenta</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Créala sin contraseña para poder matricularla y emitirle un certificado.
              La cuenta quedará como "provisional" y se activará sola cuando la
              persona se registre con el mismo documento y correo.
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email *</label>
            <input
              {...register("email")}
              type="email"
              placeholder="usuario@ejemplo.com"
              className={FIELD}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {!isProvisional && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Contraseña *</label>
              <input
                {...register("password")}
                type="password"
                placeholder="Mínimo 8 caracteres"
                className={FIELD}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Rol</label>
            <select
              {...register("role_id")}
              className={FIELD}
              disabled={isLoadingRoles}>
              <option value="">(Estudiante por defecto)</option>
              {roles?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {!isProvisional && (
            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="create_is_active"
                {...register("is_active")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="create_is_active" className="text-sm font-medium">
                Cuenta activa
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          {isPending ? "Creando…" : isProvisional ? "Crear persona sin cuenta" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
/** EDIT — Profile tab: PUT /admin/users/{id} */
function EditProfileTab({ user, onClose }: { user: User; onClose: () => void }) {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const updateProfile = useUpdateUserProfile();
  const activateUser = useActivateUser();
  const changeRole = useChangeUserRole();

  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<AdminEditProfileInput, any, AdminEditProfileInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(adminEditProfileSchema) as any,
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number ?? "",
      bio: user.bio ?? "",
      avatar_url: user.avatar_url ?? "",
      role_id: user.role_id ?? "",
      is_active: user.is_active,
    },
  });

  async function onSubmit(data: AdminEditProfileInput) {
    const promises: Promise<unknown>[] = [];

    // Profile update (name, phone, bio, avatar)
    promises.push(
      updateProfile.mutateAsync({ userId: user.id, data }),
    );

    // Role change (separate endpoint)
    if (data.role_id && data.role_id !== "" && data.role_id !== user.role_id) {
      promises.push(
        new Promise<void>((res, rej) =>
          changeRole.mutate(
            { id: user.id, role_id: data.role_id as string },
            { onSuccess: () => res(), onError: rej },
          ),
        ),
      );
    }

    // Activation toggle (separate endpoint)
    if (data.is_active !== undefined && data.is_active !== user.is_active) {
      promises.push(
        new Promise<void>((res, rej) =>
          activateUser.mutate(
            { id: user.id, is_active: data.is_active! },
            { onSuccess: () => res(), onError: rej },
          ),
        ),
      );
    }

    await Promise.allSettled(promises);
    onClose();
  }

  const isPending =
    updateProfile.isPending || activateUser.isPending || changeRole.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre *</label>
          <input {...register("first_name")} placeholder="Ana" className={FIELD} />
          {errors.first_name && (
            <p className="text-xs text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Apellido *</label>
          <input {...register("last_name")} placeholder="García" className={FIELD} />
          {errors.last_name && (
            <p className="text-xs text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Teléfono</label>
        <input
          {...register("phone_number")}
          placeholder="+51 999 000 000"
          className={FIELD}
        />
        {errors.phone_number && (
          <p className="text-xs text-destructive">{errors.phone_number.message}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Biografía</label>
        <textarea
          {...register("bio")}
          placeholder="Descripción corta del usuario…"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {/* Avatar URL */}
      <div className="space-y-1">
        <label className="text-sm font-medium">URL de avatar</label>
        <input
          {...register("avatar_url")}
          placeholder="https://..."
          className={FIELD}
        />
        {errors.avatar_url && (
          <p className="text-xs text-destructive">{errors.avatar_url.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Rol</label>
        <select {...register("role_id")} className={FIELD} disabled={isLoadingRoles}>
          <option value="">(Sin rol definido)</option>
          {roles?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Is active toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Estado de la cuenta</p>
          <p className="text-xs text-muted-foreground">
            {user.is_active
              ? "La cuenta está activa y puede iniciar sesión."
              : "La cuenta está desactivada."}
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            id="edit_is_active"
            {...register("is_active")}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted-foreground/30 rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
          <span className="text-sm font-medium">
            {user.is_active ? "Activo" : "Inactivo"}
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
        {isPending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
/** EDIT — Document tab: PATCH /users/{user_id}/document */
function EditDocumentTab({ user, onClose }: { user: User; onClose: () => void }) {
  const updateDocument = useUpdateUserDocument();

  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<UpdateDocumentInput, any, UpdateDocumentInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateDocumentSchema) as any,
    defaultValues: {
      document_type: (user.document_type as "DNI" | "CE" | "PASAPORTE") ?? "DNI",
      document_number: user.document_number ?? "",
    },
  });

  function onSubmit(data: UpdateDocumentInput) {
    updateDocument.mutate(
      { userId: user.id, data },
      { onSuccess: onClose },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Info banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 p-3">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <strong>Acción administrativa:</strong> como administrador puedes corregir o
          reemplazar el documento del usuario. La plataforma validará que no exista en otro
          perfil.
        </p>
      </div>

      {/* Current doc info */}
      {user.document_number && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Documento actual: </span>
          <span className="font-medium">
            {user.document_type} — {user.document_number}
          </span>
        </div>
      )}

      {/* Document type + number */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo de doc. *</label>
          <select {...register("document_type")} className={FIELD}>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.document_type && (
            <p className="text-xs text-destructive">{errors.document_type.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">N.º de documento *</label>
          <input
            {...register("document_number")}
            placeholder="12345678"
            className={FIELD}
          />
          {errors.document_number && (
            <p className="text-xs text-destructive">{errors.document_number.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={updateDocument.isPending}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
        {updateDocument.isPending ? "Actualizando documento…" : "Actualizar documento"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
/** EDIT — Access tab: quick activate/deactivate & course access status */
function EditAccessTab({ user, onClose, onResetPassword }: { user: User; onClose: () => void; onResetPassword?: (user: User) => void }) {
  const activateUser = useActivateUser();

  const accessLabel: Record<string, string> = {
    NONE: "Sin acceso",
    PENDING: "Pendiente de aprobación",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
  };

  const accessColor: Record<string, string> = {
    NONE: "text-muted-foreground bg-muted",
    PENDING: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30",
    APPROVED: "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30",
    REJECTED: "text-destructive bg-destructive/10",
  };

  return (
    <div className="space-y-4">
      {/* Provisional account notice */}
      {user.is_claimed === false && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Cuenta provisional
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            Esta persona todavía no tiene contraseña ni puede iniciar sesión — el
            registro se creó solo para matricularla y emitirle un certificado. Se
            activará sola en cuanto se registre con el mismo documento y correo
            ({user.email}), o puedes asignarle una contraseña manualmente abajo.
          </p>
        </div>
      )}

      {/* Course access status (read-only, managed via AccessModal) */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <p className="text-sm font-medium">Acceso al catálogo de cursos</p>
        <p className="text-xs text-muted-foreground">
          Para aprobar o rechazar el acceso usa el botón de &quot;Acceso&quot; en la tabla de usuarios.
        </p>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            accessColor[user.course_access] ?? "text-muted-foreground bg-muted"
          }`}>
          {accessLabel[user.course_access] ?? user.course_access}
        </span>
      </div>

      {/* Account status toggle */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Estado de cuenta</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user.is_active
                ? "El usuario puede iniciar sesión."
                : "La cuenta está bloqueada."}
            </p>
          </div>
          <button
            type="button"
            disabled={activateUser.isPending}
            onClick={() =>
              activateUser.mutate({ id: user.id, is_active: !user.is_active })
            }
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${
              user.is_active
                ? "border border-destructive text-destructive hover:bg-destructive/10"
                : "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
            }`}>
            {activateUser.isPending ? (
              "…"
            ) : user.is_active ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                Desactivar cuenta
              </>
            ) : (
              <>
                <Unlock className="h-3.5 w-3.5" />
                Activar cuenta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Password Reset */}
      {onResetPassword && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Contraseña</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Forzar el cambio de contraseña del usuario.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onResetPassword(user);
              }}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Cambiar contraseña
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main UserModal
// ─────────────────────────────────────────────────────────────────────────────

export function UserModal({ isOpen, onClose, user, onResetPassword }: UserModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (!isOpen) return null;

  const isEditing = !!user;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Perfil", icon: <UserIcon className="h-3.5 w-3.5" /> },
    { id: "document", label: "Documento", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "access", label: "Acceso", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  ];

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isEditing
              ? `Editar — ${user.full_name || `${user.first_name} ${user.last_name}`}`
              : "Crear nuevo usuario"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs — only in edit mode */}
        {isEditing && (
          <div className="flex border-b border-border px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          {!isEditing && <CreateUserForm onClose={onClose} />}
          {isEditing && activeTab === "profile" && (
            <EditProfileTab user={user} onClose={onClose} />
          )}
          {isEditing && activeTab === "document" && (
            <EditDocumentTab user={user} onClose={onClose} />
          )}
          {isEditing && activeTab === "access" && <EditAccessTab user={user} onClose={onClose} onResetPassword={onResetPassword} />}
        </div>
      </div>
      </div>
    </Portal>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  userCreateSchema,
  adminEditProfileSchema,
  type UserCreateInput,
  type AdminEditProfileInput,
} from "@/features/users/schemas/user.schema";
import { useRoles } from "@/features/roles/hooks/useRoles";
import type { User } from "@/types";

const DOC_TYPES = ["DNI", "CE", "PASAPORTE", "RUC"] as const;

const FIELD =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface UserFormProps {
  mode: "create" | "edit";
  defaultValues?: User;
  onSubmit: (data: UserCreateInput | AdminEditProfileInput) => void;
  isLoading?: boolean;
}

export function UserForm({
  mode,
  defaultValues,
  onSubmit,
  isLoading,
}: UserFormProps) {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();

  // ── Create mode ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createForm = useForm<UserCreateInput, any, UserCreateInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(userCreateSchema) as any,
    defaultValues: { document_type: "DNI", is_active: true },
  });

  // ── Edit mode ────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editForm = useForm<AdminEditProfileInput, any, AdminEditProfileInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(adminEditProfileSchema) as any,
    defaultValues:
      mode === "edit" && defaultValues
        ? {
            first_name: defaultValues.first_name,
            last_name: defaultValues.last_name,
            phone_number: defaultValues.phone_number ?? "",
            bio: defaultValues.bio ?? "",
            avatar_url: defaultValues.avatar_url ?? "",
            role_id: defaultValues.role_id ?? "",
            is_active: defaultValues.is_active,
          }
        : undefined,
  });

  // ── Create form render ───────────────────────────────────────────────────
  if (mode === "create") {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = createForm;

    return (
      <form onSubmit={handleSubmit((d) => onSubmit(d))} className="space-y-4">
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

        {/* Email */}
        <div className="space-y-1">
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

        {/* Password */}
        <div className="space-y-1">
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

        {/* Document */}
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

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Teléfono</label>
          <input
            {...register("phone_number")}
            placeholder="+51 999 000 000"
            className={FIELD}
          />
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Rol</label>
          <select
            {...register("role_id")}
            className={FIELD}
            disabled={isLoadingRoles}>
            <option value="">(Sin rol definido)</option>
            {roles?.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Is active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="create_is_active"
            {...register("is_active")}
            className="h-4 w-4"
          />
          <label htmlFor="create_is_active" className="text-sm font-medium">
            Cuenta activa
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          {isLoading ? "Creando…" : "Crear usuario"}
        </button>
      </form>
    );
  }

  // ── Edit form render ─────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = editForm;

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d))} className="space-y-4">
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

      {/* Is active */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="edit_is_active"
          {...register("is_active")}
          className="h-4 w-4"
        />
        <label htmlFor="edit_is_active" className="text-sm font-medium">
          Cuenta activa
        </label>
      </div>

      {/* Document change notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 p-3">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Para corregir el documento del usuario usa la pestaña{" "}
          <strong>Documento</strong> en el modal de edición.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
        {isLoading ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

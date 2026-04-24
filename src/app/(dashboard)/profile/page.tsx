"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useMe, useUpdateMe } from "@/features/users/hooks/useUsers";
import {
	profileEditSchema,
	type ProfileEditInput,
} from "@/features/users/schemas/user.schema";
import {
	User,
	Mail,
	Phone,
	Shield,
	Hash,
	FileText,
	Calendar,
	CheckCircle,
	XCircle,
} from "lucide-react";

const FIELD =
	"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const TEXTAREA =
	"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function InfoRow({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
			<Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
			<div className="min-w-0">
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="text-sm font-medium text-foreground wrap-break-word">
					{value ?? "—"}
				</p>
			</div>
		</div>
	);
}

export default function ProfilePage() {
	const { data: session } = useSession();
	const { data: me, isLoading } = useMe();
	const updateMe = useUpdateMe();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileEditInput>({
		resolver: zodResolver(profileEditSchema),
		defaultValues: {
			first_name: "",
			last_name: "",
			phone_number: "",
			bio: "",
			avatar_url: "",
		},
	});

	// Populate form once profile data is loaded
	useEffect(() => {
		if (me) {
			reset({
				first_name: me.first_name ?? "",
				last_name: me.last_name ?? "",
				phone_number: me.phone_number ?? "",
				bio: me.bio ?? "",
				avatar_url: me.avatar_url ?? "",
			});
		}
	}, [me, reset]);

	function onSubmit(data: ProfileEditInput) {
		// Strip empty strings so the API doesn't receive empty fields
		const payload: ProfileEditInput = {
			first_name: data.first_name,
			last_name: data.last_name,
			phone_number: data.phone_number || undefined,
			bio: data.bio || undefined,
			avatar_url: data.avatar_url || undefined,
		};
		updateMe.mutate(payload);
	}

	const initials = me
		? `${me.first_name?.[0] ?? ""}${me.last_name?.[0] ?? ""}`.toUpperCase()
		: session?.user
			? `${session.user.firstName?.[0] ?? ""}${session.user.lastName?.[0] ?? ""}`.toUpperCase()
			: "?";

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-foreground">Mi Perfil</h2>
				<p className="text-sm text-muted-foreground">
					Información de tu cuenta y configuración personal.
				</p>
			</div>

			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando perfil…</p>
			)}

			{!isLoading && me && (
				<div className="grid gap-6 md:grid-cols-[280px_1fr]">
					{/* ── Left column: read-only info ── */}
					<div className="space-y-4">
						{/* Avatar */}
						<div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6">
							{me.avatar_url ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={me.avatar_url}
									alt="Avatar"
									className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/30"
								/>
							) : (
								<div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
									{initials}
								</div>
							)}
							<div className="text-center">
								<p className="font-semibold text-foreground">{me.full_name}</p>
								<p className="text-xs text-muted-foreground capitalize">
									{me.role_name ?? session?.user.roleName ?? "—"}
								</p>
							</div>
						</div>

						{/* Account details */}
						<div className="rounded-xl border border-border bg-card px-4 py-2">
							<InfoRow icon={Mail} label="Email" value={me.email} />
							<InfoRow
								icon={Hash}
								label={me.document_type}
								value={me.document_number}
							/>
							<InfoRow icon={Phone} label="Teléfono" value={me.phone_number} />
							<InfoRow
								icon={Shield}
								label="Rol"
								value={
									<span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
										{me.role_name ?? "—"}
									</span>
								}
							/>
							<InfoRow
								icon={CheckCircle}
								label="Estado de cuenta"
								value={
									me.is_active ? (
										<span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
											<CheckCircle className="h-3.5 w-3.5" /> Activa
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-destructive">
											<XCircle className="h-3.5 w-3.5" /> Inactiva
										</span>
									)
								}
							/>
							<InfoRow
								icon={Calendar}
								label="Miembro desde"
								value={new Date(me.created_at).toLocaleDateString("es-PE", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							/>
						</div>

						{/* Bio preview */}
						{me.bio && (
							<div className="rounded-xl border border-border bg-card p-4">
								<div className="flex items-center gap-2 mb-2">
									<FileText className="h-4 w-4 text-muted-foreground" />
									<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Bio
									</span>
								</div>
								<p className="text-sm text-foreground whitespace-pre-wrap">
									{me.bio}
								</p>
							</div>
						)}
					</div>

					{/* ── Right column: edit form ── */}
					<div className="rounded-xl border border-border bg-card p-6">
						<h3 className="mb-4 text-base font-semibold text-foreground">
							Editar información
						</h3>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1">
									<label className="text-sm font-medium">Nombre *</label>
									<input
										{...register("first_name")}
										placeholder="Ana"
										className={FIELD}
									/>
									{errors.first_name && (
										<p className="text-xs text-destructive">
											{errors.first_name.message}
										</p>
									)}
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium">Apellido *</label>
									<input
										{...register("last_name")}
										placeholder="García"
										className={FIELD}
									/>
									{errors.last_name && (
										<p className="text-xs text-destructive">
											{errors.last_name.message}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium">
									Teléfono{" "}
									<span className="font-normal text-muted-foreground">
										(Opcional)
									</span>
								</label>
								<input
									{...register("phone_number")}
									placeholder="+51 999 000 000"
									className={FIELD}
								/>
								{errors.phone_number && (
									<p className="text-xs text-destructive">
										{errors.phone_number.message}
									</p>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium">
									URL de avatar{" "}
									<span className="font-normal text-muted-foreground">
										(Opcional)
									</span>
								</label>
								<input
									{...register("avatar_url")}
									placeholder="https://…"
									className={FIELD}
								/>
								{errors.avatar_url && (
									<p className="text-xs text-destructive">
										{errors.avatar_url.message}
									</p>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium">
									Bio{" "}
									<span className="font-normal text-muted-foreground">
										(Opcional)
									</span>
								</label>
								<textarea
									{...register("bio")}
									placeholder="Cuéntanos algo sobre ti…"
									rows={4}
									className={TEXTAREA}
								/>
								{errors.bio && (
									<p className="text-xs text-destructive">
										{errors.bio.message}
									</p>
								)}
							</div>

							<button
								type="submit"
								disabled={!isDirty || updateMe.isPending}
								className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
								{updateMe.isPending ? "Guardando…" : "Guardar cambios"}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

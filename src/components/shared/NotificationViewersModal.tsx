"use client";

import { X, Globe, User, Eye, Book, Trash2, Users } from "lucide-react";
import { useViewers } from "@/features/notifications/hooks/useNotifications";

interface Props {
	notificationId: string | null;
	onClose: () => void;
}

export function NotificationViewersModal({ notificationId, onClose }: Props) {
	const { data, isLoading, isError } = useViewers(notificationId);

	if (!notificationId) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<div className="flex items-center gap-2">
						<Eye className="h-4 w-4 text-primary" />
						<h2 className="text-base font-semibold text-foreground">
							Estadísticas de visualización
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="p-6">
					{isLoading && (
						<p className="text-center text-sm text-muted-foreground py-8">
							Cargando estadísticas…
						</p>
					)}

					{isError && (
						<p className="text-center text-sm text-destructive py-8">
							Error al cargar las estadísticas.
						</p>
					)}

					{data && (
						<>
							{/* Type badge */}
							<div className="mb-4 flex items-center gap-2">
								{data.is_global ? (
									<span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
										<Globe className="h-3 w-3" />
										Notificación global (broadcast)
									</span>
								) : (
									<span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
										<User className="h-3 w-3" />
										Notificación dirigida
									</span>
								)}
							</div>

							{/* Stats grid */}
							{data.is_global ? (
								<>
									<div className="grid grid-cols-2 gap-3">
										<StatCard
											icon={<Users className="h-4 w-4 text-muted-foreground" />}
											label="Usuarios activos"
											value={data.total_active_users}
										/>
										<StatCard
											icon={<Eye className="h-4 w-4 text-blue-500" />}
											label="Vieron (Redis)"
											value={data.seen_count}
										/>
										<StatCard
											icon={<Book className="h-4 w-4 text-green-500" />}
											label="Leyeron"
											value={data.read_count}
										/>
										<StatCard
											icon={<Trash2 className="h-4 w-4 text-destructive" />}
											label="Descartaron"
											value={data.deleted_count}
										/>
									</div>
									{data.viewer_ids.length > 0 && (
										<div className="mt-4">
											<p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
												IDs de usuarios que vieron ({data.viewer_ids.length})
											</p>
											<div className="max-h-36 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
												{data.viewer_ids.map((id) => (
													<p
														key={id}
														className="font-mono text-xs text-foreground/80">
														{id}
													</p>
												))}
											</div>
										</div>
									)}
								</>
							) : (
								<>
									<div className="grid grid-cols-2 gap-3">
										<StatCard
											icon={<Users className="h-4 w-4 text-muted-foreground" />}
											label="Destinatarios"
											value={data.delivered_to}
										/>
										<StatCard
											icon={<Book className="h-4 w-4 text-green-500" />}
											label="Leídas"
											value={data.read_count}
										/>
										<StatCard
											icon={<Eye className="h-4 w-4 text-yellow-500" />}
											label="Sin leer"
											value={data.unread_count}
										/>
										<StatCard
											icon={<Trash2 className="h-4 w-4 text-destructive" />}
											label="Descartaron"
											value={data.deleted_count}
										/>
									</div>

									{data.interactions.length > 0 && (
										<div className="mt-4">
											<p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
												Interacciones por usuario
											</p>
											<div className="max-h-52 overflow-y-auto rounded-md border border-border divide-y divide-border">
												{data.interactions.map((i) => (
													<div
														key={i.user_id}
														className="flex items-center justify-between px-3 py-2 text-xs">
														<span className="font-mono text-foreground/70 truncate max-w-45">
															{i.user_id}
														</span>
														<div className="flex items-center gap-2 shrink-0">
															{i.is_deleted ? (
																<span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">
																	Descartó
																</span>
															) : i.is_read ? (
																<span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">
																	Leída
																</span>
															) : (
																<span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
																	Sin leer
																</span>
															)}
															{i.read_at && (
																<span className="text-muted-foreground/60">
																	{new Date(i.read_at).toLocaleDateString(
																		"es-PE",
																		{
																			day: "2-digit",
																			month: "short",
																			hour: "2-digit",
																			minute: "2-digit",
																		},
																	)}
																</span>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</>
							)}
						</>
					)}
				</div>

				<div className="border-t border-border px-6 py-3 flex justify-end">
					<button
						type="button"
						onClick={onClose}
						className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
						Cerrar
					</button>
				</div>
			</div>
		</div>
	);
}

function StatCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: number;
}) {
	return (
		<div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
			{icon}
			<div>
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="text-lg font-bold text-foreground">{value}</p>
			</div>
		</div>
	);
}

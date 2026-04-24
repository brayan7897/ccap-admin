"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationForm } from "@/components/forms/NotificationForm";
import { useCreateNotification } from "@/features/notifications/hooks/useNotifications";
import { useUsers } from "@/features/users/hooks/useUsers";
import type { NotificationInput } from "@/features/notifications/schemas/notification.schema";

export default function NewNotificationPage() {
	const router = useRouter();
	const createNotification = useCreateNotification();
	const { data: users } = useUsers();

	function handleSubmit(data: NotificationInput) {
		createNotification.mutate(data, {
			onSuccess: () => router.push("/notifications"),
		});
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<Link
				href="/notifications"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
				<ArrowLeft className="h-4 w-4" />
				Volver a notificaciones
			</Link>

			<div>
				<h2 className="text-xl font-semibold text-foreground">
					Nueva notificación
				</h2>
				<p className="text-sm text-muted-foreground">
					Envía un mensaje a usuarios de la plataforma.
				</p>
			</div>

			<div className="rounded-xl border border-border bg-card p-6">
				<NotificationForm
					onSubmit={handleSubmit}
					isLoading={createNotification.isPending}
					users={users ?? []}
				/>
			</div>
		</div>
	);
}

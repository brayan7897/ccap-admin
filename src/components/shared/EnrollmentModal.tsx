"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAdminEnroll } from "@/features/enrollments/hooks/useEnrollments";
import { useUsersCatalog, useCoursesCatalog } from "@/hooks/useCatalog";

interface EnrollmentModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
	const [userId, setUserId] = useState("");
	const [courseId, setCourseId] = useState("");

	const adminEnroll = useAdminEnroll();
	const { users, isLoading: usersLoading } = useUsersCatalog();
	const { courses, isLoading: coursesLoading } = useCoursesCatalog();

	if (!isOpen) return null;

	const publishedCourses = courses.filter((c) => c.is_published);

	function handleClose() {
		setUserId("");
		setCourseId("");
		onClose();
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!userId || !courseId) return;

		adminEnroll.mutate(
			{ user_id: userId, course_id: courseId },
			{ onSuccess: handleClose },
		);
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) handleClose();
			}}>
			<div className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground">
						Matricular usuario
					</h2>
					<button
						onClick={handleClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
					{/* User select */}
					<div className="space-y-1.5">
						<label className="text-sm font-medium text-foreground">
							Usuario
						</label>
						<select
							value={userId}
							onChange={(e) => setUserId(e.target.value)}
							required
							disabled={usersLoading}
							className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
							<option value="">
								{usersLoading ? "Cargando usuarios…" : "Seleccionar usuario"}
							</option>
							{users.map((u) => (
								<option key={u.id} value={u.id}>
									{u.full_name || `${u.first_name} ${u.last_name}`.trim()} —{" "}
									{u.email}
								</option>
							))}
						</select>
					</div>

					{/* Course select */}
					<div className="space-y-1.5">
						<label className="text-sm font-medium text-foreground">Curso</label>
						<select
							value={courseId}
							onChange={(e) => setCourseId(e.target.value)}
							required
							disabled={coursesLoading}
							className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
							<option value="">
								{coursesLoading ? "Cargando cursos…" : "Seleccionar curso"}
							</option>
							{publishedCourses.map((c) => (
								<option key={c.id} value={c.id}>
									{c.title} {c.course_type === "PAID" ? "(Pago)" : "(Gratis)"}
								</option>
							))}
						</select>
						<p className="text-xs text-muted-foreground">
							Solo cursos publicados. Para cursos de pago se requiere esta
							acción de administrador.
						</p>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={handleClose}
							className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
							Cancelar
						</button>
						<button
							type="submit"
							disabled={adminEnroll.isPending || !userId || !courseId}
							className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
							{adminEnroll.isPending ? "Matriculando…" : "Matricular"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

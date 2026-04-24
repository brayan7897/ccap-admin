"use client";

import { CourseForm } from "@/components/forms/CourseForm";
import {
	useCourse,
	useCreateCourse,
	useUpdateCourse,
} from "@/features/courses/hooks/useCourses";
import type { CourseInput } from "@/features/courses/schemas/course.schema";
import { ModulesTab } from "./_module-editor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "info" | "modules";

interface Props {
	params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: Props) {
	const { id } = use(params);
	const isNew = id === "new";
	const router = useRouter();
	const [tab, setTab] = useState<Tab>("info");

	const { data: course, isLoading } = useCourse(isNew ? "" : id);
	const createCourse = useCreateCourse();
	const updateCourse = useUpdateCourse(id);

	const handleSubmit = async (data: CourseInput) => {
		if (isNew) {
			await createCourse.mutateAsync(data);
		} else {
			await updateCourse.mutateAsync(data);
		}
		router.push("/courses");
	};

	if (!isNew && isLoading) {
		return <p className="text-sm text-muted-foreground">Cargando curso...</p>;
	}

	const tabs: { key: Tab; label: string }[] = [
		{ key: "info", label: "Informacion" },
		...(isNew ? [] : [{ key: "modules" as Tab, label: "Modulos" }]),
	];

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<Link
				href="/courses"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
				<ArrowLeft className="h-4 w-4" />
				Volver a cursos
			</Link>

			<div>
				<h2 className="text-xl font-semibold text-foreground">
					{isNew ? "Nuevo curso" : (course?.title ?? "Editar curso")}
				</h2>
				<p className="text-sm text-muted-foreground">
					{isNew
						? "Completa los datos para crear un nuevo curso."
						: "Gestiona la informacion y el contenido de este curso."}
				</p>
			</div>

			<div className="flex gap-1 border-b border-border">
				{tabs.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => setTab(key)}
						className={cn(
							"px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
							tab === key
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}>
						{label}
					</button>
				))}
			</div>

			{tab === "info" && (
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
					<CourseForm
						defaultValues={
							course
								? {
										title: course.title,
										slug: course.slug,
										short_description: course.short_description ?? undefined,
										description: course.description ?? undefined,
										course_level: course.course_level,
										course_type: course.course_type,
										price: course.price ?? null,
										instructor_id: course.instructor_id,
										category_id: course.category_id ?? undefined,
										is_published: course.is_published,
										thumbnail_url: course.thumbnail_url ?? "",
										requirements: course.requirements,
										what_you_will_learn: course.what_you_will_learn,
										tags: course.tags,
									}
								: undefined
						}
						onSubmit={handleSubmit}
						isLoading={createCourse.isPending || updateCourse.isPending}
					/>
				</div>
			)}

			{tab === "modules" && !isNew && <ModulesTab courseId={id} />}
		</div>
	);
}

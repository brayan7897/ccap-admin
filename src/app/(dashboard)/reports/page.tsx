"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { EnrollmentsReportTab } from "./_components/EnrollmentsReportTab";
import { StudentProgressReportTab } from "./_components/StudentProgressReportTab";
import { CertificatesReportTab } from "./_components/CertificatesReportTab";
import { UsersRegistrationReportTab } from "./_components/UsersRegistrationReportTab";
import { ActivityReportTab } from "./_components/ActivityReportTab";

const TABS = [
	{ id: "enrollments", label: "Matrículas" },
	{ id: "student-progress", label: "Progreso de estudiantes" },
	{ id: "certificates", label: "Certificados" },
	{ id: "users-registration", label: "Registro de usuarios" },
	{ id: "activity", label: "Actividad de usuarios" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ReportsPage() {
	const [activeTab, setActiveTab] = useState<TabId>("enrollments");

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-foreground">Reportes</h2>
				<p className="text-sm text-muted-foreground">
					Extracción de datos administrativos y exportación a PDF.
				</p>
			</div>

			<div className="flex flex-wrap gap-2 border-b border-border">
				{TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
							activeTab === tab.id
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}>
						{tab.label}
					</button>
				))}
			</div>

			{activeTab === "enrollments" && <EnrollmentsReportTab />}
			{activeTab === "student-progress" && <StudentProgressReportTab />}
			{activeTab === "certificates" && <CertificatesReportTab />}
			{activeTab === "users-registration" && <UsersRegistrationReportTab />}
			{activeTab === "activity" && <ActivityReportTab />}
		</div>
	);
}

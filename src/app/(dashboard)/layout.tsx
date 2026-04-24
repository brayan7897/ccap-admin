import { Navbar } from "@/components/shared/Navbar";
import { Sidebar } from "@/components/shared/Sidebar";
import { SessionGuard } from "@/components/providers/SessionGuard";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SessionGuard>
			<div className="flex h-screen overflow-hidden bg-background">
				<Sidebar />
				<div className="flex flex-1 flex-col overflow-hidden">
					<Navbar />
					<main className="flex-1 overflow-y-auto p-6">{children}</main>
				</div>
			</div>
		</SessionGuard>
	);
}

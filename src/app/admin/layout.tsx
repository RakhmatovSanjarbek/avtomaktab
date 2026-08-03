import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { IdleLogoutProvider } from "@/components/providers/idle-logout-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "ADMIN" && currentRole !== "SUPER_ADMIN") {
    redirect("/student");
  }

  if (currentRole === "ADMIN") {
    const isActive = (session.user as any).isActive;
    const workDays = (session.user as any).workDays as number[] | null;
    const workStartTime = (session.user as any).workStartTime as string | null;
    const workEndTime = (session.user as any).workEndTime as string | null;
    const { isWithinWorkingHours } = await import("@/lib/schedule");
    if (!isActive || !isWithinWorkingHours(workDays, workStartTime, workEndTime)) {
      redirect("/login");
    }
  }

  const allowedSections = ((session.user as any).allowedSections ?? []) as string[];

  return (
    <IdleLogoutProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar role={currentRole} allowedSections={allowedSections} />
        <div className="flex flex-1 flex-col">
          <AdminHeader fullName={session.user.name ?? ""} />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </IdleLogoutProvider>
  );
}

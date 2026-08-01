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
  if ((session.user as any).role !== "ADMIN") {
    redirect("/student");
  }

  return (
    <IdleLogoutProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminHeader fullName={session.user.name ?? ""} />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </IdleLogoutProvider>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { IdleLogoutProvider } from "@/components/providers/idle-logout-provider";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as any).role;
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  return (
    <IdleLogoutProvider>
      <div className="min-h-screen bg-background">
        <Topbar
          fullName={session.user.name ?? ""}
          role={(session.user as any).role ?? "STUDENT"}
        />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </IdleLogoutProvider>
  );
}

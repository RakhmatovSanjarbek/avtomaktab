import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/require-admin";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { AdminsList } from "@/components/admin/admins-list";

export default async function AdminsPage() {
  const session = await requireSuperAdmin();
  if (!session) redirect("/admin");

  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.admin.admins.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.admin.admins.desc}</p>
      </div>
      <AdminsList />
    </div>
  );
}

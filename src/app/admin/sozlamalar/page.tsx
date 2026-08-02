import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { SettingsForm } from "@/components/admin/settings-form";
import { ContactSettingsForm } from "@/components/admin/contact-settings-form";
import { Server } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await auth();
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  const userId = (session?.user as any)?.id as string;
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true, email: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.admin.settings.title}</h1>
      </div>

      <SettingsForm currentName={currentUser?.fullName ?? ""} currentEmail={currentUser?.email ?? ""} />

      <ContactSettingsForm />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-foreground">{dict.admin.settings.systemTitle}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{dict.admin.settings.systemDesc}</p>
      </div>
    </div>
  );
}

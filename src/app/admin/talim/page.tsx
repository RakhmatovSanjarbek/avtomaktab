import { requireSectionAccess } from "@/lib/require-admin";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { StagesList } from "@/components/admin/stages-list";

export default async function AdminTalimPage() {
  await requireSectionAccess("talim");

  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.admin.talim.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.admin.talim.desc}</p>
      </div>
      <StagesList />
    </div>
  );
}

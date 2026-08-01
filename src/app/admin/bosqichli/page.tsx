import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { TopicsList } from "@/components/admin/topics-list";

export default async function AdminBosqichliPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.admin.bosqichli.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.admin.bosqichli.desc}</p>
      </div>
      <TopicsList />
    </div>
  );
}

import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { VariantsList } from "@/components/admin/variants-list";

export default async function AdminQuestionsPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.admin.questions.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.admin.questions.desc}</p>
      </div>
      <VariantsList />
    </div>
  );
}

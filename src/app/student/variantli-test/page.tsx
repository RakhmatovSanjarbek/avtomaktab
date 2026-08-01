import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { VariantsListStudent } from "@/components/student/variants-list-student";

export default async function StudentVariantliPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.studentVariantli.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.studentVariantli.desc}</p>
      </div>
      <VariantsListStudent />
    </div>
  );
}

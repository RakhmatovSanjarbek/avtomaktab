import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { MistakesView } from "@/components/student/mistakes-view";

export default async function MistakesPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.studentMistakes.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.studentMistakes.desc}</p>
      </div>
      <MistakesView />
    </div>
  );
}

import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { SavedQuestionsView } from "@/components/student/saved-questions-view";

export default async function SavedQuestionsPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.studentSaved.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.studentSaved.desc}</p>
      </div>
      <SavedQuestionsView />
    </div>
  );
}

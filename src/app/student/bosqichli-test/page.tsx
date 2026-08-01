import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { TopicsListStudent } from "@/components/student/topics-list-student";

export default async function StudentBosqichliPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.studentBosqichli.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.studentBosqichli.desc}</p>
      </div>
      <TopicsListStudent />
    </div>
  );
}

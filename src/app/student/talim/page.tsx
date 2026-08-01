import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { TalimStagesList } from "@/components/student/talim-stages-list";

export default async function StudentTalimPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.studentTalim.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.studentTalim.desc}</p>
      </div>
      <TalimStagesList />
    </div>
  );
}

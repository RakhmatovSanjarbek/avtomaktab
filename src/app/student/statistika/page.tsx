import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { StudentStatsTable } from "@/components/student/student-stats-table";

export default async function StudentStatisticsPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.studentStats.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.studentStats.desc}</p>
      </div>
      <StudentStatsTable />
    </div>
  );
}

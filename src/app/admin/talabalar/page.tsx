import { requireSectionAccess } from "@/lib/require-admin";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { StudentsTable } from "@/components/admin/students-table";

export default async function AdminStudentsPage() {
  await requireSectionAccess("students");

  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.admin.students.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.admin.students.desc}</p>
      </div>

      <StudentsTable />
    </div>
  );
}

import { StudentHistoryView } from "@/components/admin/student-history-view";

export default async function AdminStudentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentHistoryView studentId={id} />;
}

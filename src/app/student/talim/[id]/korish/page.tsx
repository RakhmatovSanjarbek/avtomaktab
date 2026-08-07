import { TalimPreviewView } from "@/components/student/talim-preview-view";

export default async function TalimKorishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TalimPreviewView stageId={id} />;
}

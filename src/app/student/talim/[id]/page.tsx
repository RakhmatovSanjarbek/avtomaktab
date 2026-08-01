import { TalimStageDetail } from "@/components/student/talim-stage-detail";

export default async function TalimStageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TalimStageDetail stageId={id} />;
}

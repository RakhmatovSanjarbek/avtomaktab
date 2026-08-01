import { StageDetail } from "@/components/admin/stage-detail";

export default async function StageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StageDetail stageId={id} />;
}

import { requireSectionAccess } from "@/lib/require-admin";
import { BosqichliStageDetail } from "@/components/admin/bosqichli-stage-detail";

export default async function BosqichliDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSectionAccess("bosqichli");
  const { id } = await params;
  return <BosqichliStageDetail stageId={id} />;
}
